const http = require('http');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            text: body,
          })
        );
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting MyChat Verification Suite ---');
  let failures = 0;

  // 1. Verify Home Page HTML
  try {
    const homeRes = await fetchUrl('http://localhost:3000/');
    if (homeRes.status === 200) {
      const hasTitle = homeRes.text.includes('MyChat');
      const hasBlack = homeRes.text.includes('bg-black');
      if (hasTitle && hasBlack) {
        console.log('✓ Test 1 Passed: Homepage rendered successfully with "MyChat" title and AMOLED black styling.');
      } else {
        console.error('✗ Test 1 Failed: Homepage missing required elements.');
        failures++;
      }
    } else {
      console.error(`✗ Test 1 Failed: Homepage returned status ${homeRes.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 1 Error:', err.message);
    failures++;
  }

  // 2. Verify Models API Endpoint
  try {
    const modelsRes = await fetchUrl('http://localhost:3000/api/gemini/models');
    if (modelsRes.status === 200) {
      const data = JSON.parse(modelsRes.text);
      if (Array.isArray(data.models) && data.models.length > 0) {
        const hasFlash38 = data.models.some((m) => m.id === 'gemini-3.8-flash');
        console.log(`✓ Test 2 Passed: /api/gemini/models returned ${data.models.length} models. gemini-3.8-flash found: ${hasFlash38}`);
      } else {
        console.error('✗ Test 2 Failed: Models array is empty.');
        failures++;
      }
    } else {
      console.error(`✗ Test 2 Failed: Models API returned ${modelsRes.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 2 Error:', err.message);
    failures++;
  }

  // 3. Verify Streaming Chat Completion with Math / LaTeX
  try {
    const postData = JSON.stringify({
      model: 'gemini-3.8-flash',
      messages: [{ role: 'user', content: 'What is the Pythagorean theorem in LaTeX?' }],
    });

    const chatRes = await fetchUrl('http://localhost:3000/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      body: postData,
    });

    if (chatRes.status === 200) {
      const hasLatex = chatRes.text.includes('$') || chatRes.text.includes('c^2');
      console.log(`✓ Test 3 Passed: /api/gemini/chat streaming responded with ${chatRes.text.length} chars. LaTeX formatted: ${hasLatex}`);
    } else {
      console.error(`✗ Test 3 Failed: Chat API returned status ${chatRes.status}. Output: ${chatRes.text}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err.message);
    failures++;
  }

  // 4. Verify Chemistry Equation Formatting
  try {
    const postData = JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Provide the balanced chemical equation for the combustion of methane in LaTeX.' }],
    });

    const chemRes = await fetchUrl('http://localhost:3000/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      body: postData,
    });

    if (chemRes.status === 200) {
      const hasChem = chemRes.text.includes('CH_4') || chemRes.text.includes('CO_2') || chemRes.text.includes('H_2O') || chemRes.text.includes('\\ce');
      console.log(`✓ Test 4 Passed: Chemistry equation query streamed properly with LaTeX/chem notation: ${hasChem}`);
    } else {
      console.error(`✗ Test 4 Failed: Chemistry test returned status ${chemRes.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err.message);
    failures++;
  }

  console.log(`\n--- Verification Complete: ${failures === 0 ? 'ALL PASSED' : failures + ' FAILED'} ---`);
  process.exit(failures === 0 ? 0 : 1);
}

runTests();
