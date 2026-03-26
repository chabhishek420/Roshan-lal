import { Request, Response } from 'express';
import { serveSafePage } from './shield';
import { runQuery } from '../db';

// 26. Implement Affiliate Tracking Parameter Capture
export const captureTrackingParams = (query: any): Record<string, string> => {
  const captured: Record<string, string> = {};
  const commonParams = ['gclid', 'fbclid', 'wbraid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  for (const param of commonParams) {
    if (query[param]) {
      captured[param] = String(query[param]);
    }
  }
  
  return captured;
};

// 25. Implement href.li Referrer Stripping Integration
// 27. Implement Dynamic Parameter Pass-through to Final URL
// 28. Implement URL Sanitization and Safe Encoding
// 29. Implement Click ID Mapping to aff_sub2 Parameter
export const buildRedirectUrl = (offerUrl: string, clickId: string, params: Record<string, string>): string => {
  try {
    const url = new URL(offerUrl);
    
    // Append captured params
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
    
    // Map click_id to aff_sub2
    url.searchParams.append('aff_sub2', clickId);
    
    // URL object already encodes parameters correctly
    const sanitizedUrl = url.toString();
    
    // Wrap in href.li
    return `https://href.li/?${sanitizedUrl}`;
  } catch (error) {
    console.error('URL Build Error:', error);
    // Fallback to safe page if URL is invalid
    return '';
  }
};

// 40. Implement Hit Recording to Tracking Events Table
// 41. Implement IP and User-Agent Metadata Logging
// 42. Implement Routing Outcome and Strategy Logging
// 43. Implement Latency and Latency Processing Metrics
const recordHit = (req: Request, outcome: string, triggerReason: string, startTime: number) => {
  const latency = Date.now() - startTime;
  const ip = req.ip || '';
  const ua = req.headers['user-agent'] || '';
  
  // Synchronous write (fire-and-forget from the router's perspective)
  runQuery(
    `INSERT INTO tracking_events (click_id, visitor_id, campaign_id, pub_id, ip, user_agent, outcome, trigger_reason, latency_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.click_id,
      req.visitor_id,
      String(req.query.campaign_id || req.query.c || ''),
      String(req.query.pub_id || req.query.p || ''),
      ip,
      ua,
      outcome,
      triggerReason,
      latency
    ]
  ).catch(err => console.error('Hit Recording Error:', err));
};

// 24. Implement Core Tracking Router Decision Engine
export const routeTraffic = (req: Request, res: Response, isBot: boolean, campaign: any, startTime: number) => {
  if (isBot) {
    recordHit(req, 'SafePage', req.botTrigger || 'Bot_Detected', startTime);
    const lang = req.acceptsLanguages('zh-CN') ? 'zh-CN' : 'en';
    return serveSafePage(res, lang);
  }
  
  const capturedParams = captureTrackingParams(req.query);
  const finalUrl = buildRedirectUrl(campaign.offer_url, req.click_id, capturedParams);
  
  if (!finalUrl) {
    recordHit(req, 'SafePage', 'Invalid_Offer_URL', startTime);
    const lang = req.acceptsLanguages('zh-CN') ? 'zh-CN' : 'en';
    return serveSafePage(res, lang);
  }
  
  recordHit(req, 'Offer', 'Real_User', startTime);
  
  if (campaign.redirect_type === 'js_refresh') {
    // Implement JS double meta refresh redirect as seen in typosquat research
    const html = `<!DOCTYPE html>
<html>
<head>
    <script type="text/javascript">
    var go="${finalUrl}";
    document.write("<a href='"+go+"' target='_self' id='gl'>&nbsp;</a>");
    document.getElementById("gl").click();
    </script>
    <meta http-equiv="refresh" content="50;url=${finalUrl}">
</head>
<body>
    <h2><a href="${finalUrl}">Please wait to redirect...</a></h2>
</body>
</html>`;
    res.status(200).type('text/html').send(html);
  } else {
    // Default 302 Found redirect
    res.redirect(302, finalUrl);
  }
};
