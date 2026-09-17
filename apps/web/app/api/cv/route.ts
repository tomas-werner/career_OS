import { NextResponse } from 'next/server';
import { CV_TEMPLATES, type CvTemplate } from '@career-os/shared';

/**
 * GET /api/cv/templates
 * Retourne la configuration de tous les templates de CV.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname; // /api/cv/templates ou /api/cv/templates/ANALYSTE

  if (path === '/api/cv/templates') {
    // Liste de tous les templates
    return NextResponse.json({
      templates: Object.values(CV_TEMPLATES),
      count: Object.keys(CV_TEMPLATES).length,
    });
  }

  // Extraction du type depuis le pathname : /api/cv/templates/ANALYSTE
  const match = url.pathname.match(/^\/api\/cv\/templates\/([AUDITOR|ANALYSTE|CONTROLLEUR])/);
  if (match) {
    const type = match[1] as CvTemplate;
    const template = CV_TEMPLATES[type];
    if (!template) {
      return NextResponse.json(
        { error: 'Template introuvable' },
        { status: 404 }
      );
    }
    return NextResponse.json(template);
  }

  // Cas par défaut : retourner la liste
  return NextResponse.json({
    templates: Object.values(CV_TEMPLATES),
    count: Object.keys(CV_TEMPLATES).length,
  });
}