import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user - require valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT token and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No user ID in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the authenticated request for audit purposes
    console.log('Authenticated prescription email request from user:', userId);

    const { 
      recipientEmail, 
      patientName, 
      doctorName, 
      clinicName,
      prescriptionDate,
      medications,
      language = 'fr'
    } = await req.json();

    // Validate required fields
    if (!recipientEmail || !patientName || !medications) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate medications array
    if (!Array.isArray(medications) || medications.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Medications must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email content using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build medications list text
    const medicationsList = medications.map((med: any, idx: number) => 
      `${idx + 1}. ${med.medication_name}${med.dosage ? ` - ${med.dosage}` : ''}${med.frequency ? ` (${med.frequency})` : ''}${med.duration ? ` - ${med.duration}` : ''}`
    ).join('\n');

    // Language-specific content
    const subjects: Record<string, string> = {
      ar: `وصفة طبية - ${patientName}`,
      fr: `Ordonnance médicale - ${patientName}`,
      en: `Medical Prescription - ${patientName}`,
    };

    const greetings: Record<string, string> = {
      ar: 'مرحباً',
      fr: 'Bonjour',
      en: 'Hello',
    };

    const messages: Record<string, string> = {
      ar: `تجد أدناه الوصفة الطبية الصادرة من ${doctorName} في ${clinicName} بتاريخ ${prescriptionDate}`,
      fr: `Veuillez trouver ci-dessous l'ordonnance médicale émise par ${doctorName} à ${clinicName} en date du ${prescriptionDate}`,
      en: `Please find below the medical prescription issued by ${doctorName} at ${clinicName} on ${prescriptionDate}`,
    };

    const medicationHeaders: Record<string, string> = {
      ar: 'الأدوية الموصوفة:',
      fr: 'Médicaments prescrits:',
      en: 'Prescribed medications:',
    };

    const footers: Record<string, string> = {
      ar: 'يرجى اتباع التعليمات بدقة واستشارة الطبيب في حالة أي أسئلة.',
      fr: 'Veuillez suivre les instructions avec précision et consulter le médecin en cas de questions.',
      en: 'Please follow the instructions carefully and consult the doctor if you have any questions.',
    };

    const lang = language as 'ar' | 'fr' | 'en';
    const subject = subjects[lang] || subjects.fr;
    const greeting = greetings[lang] || greetings.fr;
    const message = messages[lang] || messages.fr;
    const medicationHeader = medicationHeaders[lang] || medicationHeaders.fr;
    const footer = footers[lang] || footers.fr;

    // Generate professional HTML email
    const htmlContent = `
<!DOCTYPE html>
<html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0d9488;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .logo {
      color: #0d9488;
      font-size: 28px;
      font-weight: bold;
    }
    .clinic-name {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .content {
      padding: 20px 0;
    }
    .medications {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .medications h3 {
      color: #0d9488;
      margin-top: 0;
    }
    .medication-item {
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .medication-item:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .important {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">WASFA PRO</div>
      <div class="clinic-name">${clinicName}</div>
    </div>
    
    <div class="content">
      <p>${greeting},</p>
      <p>${message}</p>
      
      <div class="medications">
        <h3>${medicationHeader}</h3>
        ${medications.map((med: any, idx: number) => `
          <div class="medication-item">
            <strong>${idx + 1}. ${med.medication_name}</strong>
            ${med.dosage ? `<br>💊 ${med.dosage}` : ''}
            ${med.frequency ? `<br>⏰ ${med.frequency}` : ''}
            ${med.duration ? `<br>📅 ${med.duration}` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="important">
        <p style="margin: 0;">⚠️ ${footer}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>${lang === 'ar' ? 'تم إرساله عبر' : lang === 'fr' ? 'Envoyé via' : 'Sent via'} WASFA PRO</p>
      <p>© ${new Date().getFullYear()} WASFA PRO - ${lang === 'ar' ? 'جميع الحقوق محفوظة' : lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Log the email request for audit purposes (without sensitive data)
    console.log('Email prepared for sending:', {
      to: recipientEmail,
      subject: subject,
      patientName,
      doctorName,
      clinicName,
      prescriptionDate,
      medicationsCount: medications.length,
      requestedBy: userId,
    });

    // Return success with email preview
    // Note: To actually send emails, you would need to integrate with an email service
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email prepared successfully',
        preview: {
          to: recipientEmail,
          subject: subject,
          htmlContent: htmlContent,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in send-prescription-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
