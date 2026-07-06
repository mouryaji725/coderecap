import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const oldStr = `      } catch (err: any) {
        const errMsg = err.message || '';
        if (errMsg.includes('disabled') || errMsg.includes('fetch failed') || errMsg.includes('No transcript') || errMsg.includes('too many requests') || errMsg.includes('captcha')) {
          // Info: Transcript disabled or IP blocked, fallback to oEmbed.
          try {
             const oembedRes = await fetch(\`https://www.youtube.com/oembed?url=\${encodeURIComponent(url)}&format=json\`);
             if (oembedRes.ok) {
                const oembedData = await oembedRes.json();
                videoTitle = oembedData.title || '';
                videoAuthor = oembedData.author_name || '';
             }
          } catch(e) {}
        } else {
           throw err;
        }
      }`;

const newStr = `      } catch (err: any) {
        const errMsg = err.message || '';
        throw new Error("Failed to fetch YouTube transcript. The video might not have captions, or YouTube is blocking the request. " + errMsg);
      }
      
      if (!transcriptText || transcriptText.trim().length === 0) {
         throw new Error("The video transcript is empty or unavailable. Cannot generate a study guide without transcript content.");
      }`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('server.ts', content);

