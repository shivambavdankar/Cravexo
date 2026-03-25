import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 });

    // For now, we log the welcome email intent.
    // In production you'd use Resend, SendGrid, or Supabase Edge Functions here.
    console.log(`[Welcome] Sending welcome email to ${name} <${email}>`);

    // Simulate email (replace this block with real transactional email in production)
    const emailContent = {
      to: email,
      subject: `Welcome to Cravexo, ${name?.split(' ')[0] ?? 'Foodie'}! 🍔`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #07080F; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #FF6B00, #FF2020); padding: 32px 28px;">
            <h1 style="margin: 0; font-size: 2rem; font-weight: 900;">Welcome to Crave<span style="color: rgba(255,255,255,0.7)">xo</span> 🍔</h1>
          </div>
          <div style="padding: 32px 28px;">
            <p style="font-size: 1.1rem; color: #fff; margin-bottom: 20px;">Hey ${name?.split(' ')[0] ?? 'there'}! So glad you&apos;re here.</p>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
              Cravexo is your AI-powered food discovery platform — built to help you figure out what to eat, 
              where to eat it, and how to make every meal feel like the right one.
            </p>
            <div style="background: rgba(255,107,0,0.1); border: 1px solid rgba(255,107,0,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #FF6B00; font-weight: 700; margin: 0 0 8px;">Meet Mr. Fry 🍟</p>
              <p style="color: rgba(255,255,255,0.7); margin: 0; line-height: 1.6;">
                Your personal AI food companion. Tell Mr. Fry your mood, location, and cravings — 
                and get a recommendation so accurate it feels like he read your mind.
              </p>
            </div>
            <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; line-height: 1.6;">
              Dive in, explore, and let your cravings lead the way.<br/>
              <strong style="color: #FF6B00;">The Cravexo Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    console.log('[Welcome] Email content prepared:', emailContent.subject);
    // TODO: Integrate Resend or similar: await resend.emails.send(emailContent);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Welcome] Error:', err);
    return NextResponse.json({ error: 'Failed to send welcome email.' }, { status: 500 });
  }
}
