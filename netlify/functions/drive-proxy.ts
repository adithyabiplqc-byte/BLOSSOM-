export const handler = async (event: any) => {
  const query = event.queryStringParameters || {};
  let driveId = query.id || "";
  const rawUrl = query.url || "";

  if (!driveId && rawUrl) {
    const matchD = rawUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/i);
    const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);
    const matchLh3 = rawUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
    driveId = (matchD && matchD[1]) || (matchId && matchId[1]) || (matchLh3 && matchLh3[1]) || "";
    if (!driveId && /^[a-zA-Z0-9_-]{20,60}$/.test(rawUrl)) {
      driveId = rawUrl;
    }
  }

  if (!driveId) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: "Missing Google Drive file ID parameter." })
    };
  }

  const isDownloadReq = query.download === 'true' || query.dl === '1';
  const customFilename = typeof query.filename === 'string' && query.filename.trim() ? query.filename.trim() : '';

  const candidateUrls = [
    `https://drive.google.com/uc?export=download&id=${driveId}`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
    `https://lh3.googleusercontent.com/d/${driveId}=s1600`,
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`
  ];

  for (const targetUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/pdf,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        },
        redirect: "follow",
        signal: controller.signal as any
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const isImage = contentType.startsWith("image/");
        const isPdf = contentType.includes("pdf") || contentType.startsWith("application/pdf");
        const isOctet = contentType.includes("octet-stream") || contentType.includes("binary");

        if (isImage || isPdf || isOctet) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const resolvedContentType = isImage ? contentType : (isPdf ? "application/pdf" : "image/jpeg");

          const ext = isPdf ? ".pdf" : (resolvedContentType.includes("png") ? ".png" : ".jpg");
          const dlName = customFilename || `file-${driveId}${ext}`;

          const headers: Record<string, string> = {
            "Content-Type": resolvedContentType,
            "Cache-Control": "public, max-age=604800, immutable",
            "Access-Control-Allow-Origin": "*"
          };

          if (isDownloadReq) {
            headers["Content-Disposition"] = `attachment; filename="${dlName}"`;
          }

          return {
            statusCode: 200,
            headers,
            body: buffer.toString('base64'),
            isBase64Encoded: true
          };
        }
      }
    } catch (e) {
      // try next candidate
    }
  }

  // Fallback redirect
  return {
    statusCode: 302,
    headers: {
      Location: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
      "Access-Control-Allow-Origin": "*"
    },
    body: ""
  };
};
