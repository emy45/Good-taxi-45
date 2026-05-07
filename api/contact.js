import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = 'emy@emy-com.fr';
const FROM_EMAIL = 'Good Taxi 45 <onboarding@resend.dev>';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const body = req.body || {};
    const {
      firstname = '',
      lastname = '',
      phone = '',
      email = '',
      type = '',
      from = '',
      to = '',
      date = '',
      time = '',
      message = '',
      rgpd = '',
      website = '', // honeypot
    } = body;

    // Anti-spam : si le champ honeypot est rempli, on bloque silencieusement
    if (website) {
      return res.status(200).json({ ok: true });
    }

    // Validation minimale
    if (!firstname || !lastname || !phone || !type) {
      return res.status(400).json({
        error: 'Champs obligatoires manquants (prénom, nom, téléphone, type de demande).',
      });
    }

    const typeLabels = {
      particulier: 'Course particulier',
      'gare-aeroport': 'Transfert gare / aéroport',
      entreprise: 'Entreprise / hôtel',
      colis: 'Livraison de colis',
      autre: 'Autre / question',
    };
    const typeLabel = typeLabels[type] || type;

    const subject = `[Good Taxi 45] Nouvelle demande — ${escapeHtml(firstname)} ${escapeHtml(lastname)} (${escapeHtml(typeLabel)})`;

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0b0b0b;">
        <div style="background: #0b0b0b; color: #f5c518; padding: 18px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 18px;">Nouvelle demande Good Taxi 45</h1>
        </div>
        <div style="border: 1px solid #eee; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b6256;">Type</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(typeLabel)}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6256;">Nom</td><td style="padding: 6px 0;">${escapeHtml(firstname)} ${escapeHtml(lastname)}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6256;">Téléphone</td><td style="padding: 6px 0;"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
            ${email ? `<tr><td style="padding: 6px 0; color: #6b6256;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>` : ''}
            ${from ? `<tr><td style="padding: 6px 0; color: #6b6256;">Départ</td><td style="padding: 6px 0;">${escapeHtml(from)}</td></tr>` : ''}
            ${to ? `<tr><td style="padding: 6px 0; color: #6b6256;">Arrivée</td><td style="padding: 6px 0;">${escapeHtml(to)}</td></tr>` : ''}
            ${date ? `<tr><td style="padding: 6px 0; color: #6b6256;">Date</td><td style="padding: 6px 0;">${escapeHtml(date)}</td></tr>` : ''}
            ${time ? `<tr><td style="padding: 6px 0; color: #6b6256;">Heure</td><td style="padding: 6px 0;">${escapeHtml(time)}</td></tr>` : ''}
          </table>
          ${message ? `
            <div style="margin-top: 18px; padding-top: 18px; border-top: 1px solid #eee;">
              <div style="color: #6b6256; margin-bottom: 6px;">Précisions</div>
              <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>
          ` : ''}
          <p style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #eee; color: #6b6256; font-size: 12px;">
            Reçu via le formulaire de goodtaxi45.fr — ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
          </p>
        </div>
      </div>
    `;

    const text = [
      `Nouvelle demande Good Taxi 45`,
      ``,
      `Type : ${typeLabel}`,
      `Nom : ${firstname} ${lastname}`,
      `Téléphone : ${phone}`,
      email ? `Email : ${email}` : null,
      from ? `Départ : ${from}` : null,
      to ? `Arrivée : ${to}` : null,
      date ? `Date : ${date}` : null,
      time ? `Heure : ${time}` : null,
      ``,
      message ? `Précisions :\n${message}` : null,
    ].filter(Boolean).join('\n');

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email || undefined,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}
