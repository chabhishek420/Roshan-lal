import { Response } from 'express';

// 17. Create Google 404 Safe Page HTML Generator
// 18. Add Dynamic Copyright and Year to Safe Page
// 22. Implement zh-CN Localized Safe Page
export const generateGoogle404 = (lang: string = 'en'): string => {
  const currentYear = new Date().getFullYear();
  
  if (lang === 'zh-CN') {
    return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>错误 404 (Not Found)!!1</title>
    <style>
      *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
    </style>
  </head>
  <body>
    <a href="//www.google.com/"><span id="logo" aria-label="Google"></span></a>
    <p><b>404.</b> <ins>That's an error.</ins></p>
    <p>请求的网址未在此服务器上找到。 <ins>That's all we know.</ins></p>
    <p style="font-size: 11px; color: #777; margin-top: 20px;">&copy; ${currentYear} Google</p>
  </body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Error 404 (Not Found)!!1</title>
    <style>
      *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
    </style>
  </head>
  <body>
    <a href="//www.google.com/"><span id="logo" aria-label="Google"></span></a>
    <p><b>404.</b> <ins>That's an error.</ins></p>
    <p>The requested URL was not found on this server. <ins>That's all we know.</ins></p>
    <p style="font-size: 11px; color: #777; margin-top: 20px;">&copy; ${currentYear} Google</p>
  </body>
</html>`;
};

// 19. Implement GCP Header Spoofing (via and server)
// 20. Implement Random x-rt Latency Header
export const applyGCPHeaders = (res: Response) => {
  res.setHeader('Server', 'cloudflare'); // Often seen in front of GCP or as a mask
  res.setHeader('Via', '1.1 google');
  
  // Random latency between 2ms and 45ms
  const latency = Math.floor(Math.random() * 44) + 2;
  res.setHeader('x-rt', latency.toString());
};

export const serveSafePage = (res: Response, lang: string = 'en') => {
  applyGCPHeaders(res);
  res.status(404).send(generateGoogle404(lang));
};
