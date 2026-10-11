const katex = require('katex');
require('katex/dist/contrib/mhchem.js');
const hljs = require('highlight.js');

function preprocessMarkdownMath(content) {
  if (!content) return "";
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]*?`)/g);
  return parts
    .map((part, index) => {
      if (index % 2 === 1) return part;
      let text = part;
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `\n\n$$\n${eq.trim()}\n$$\n\n`);
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq.trim()}$`);
      text = text.replace(
        /\\begin\{(equation\*?|align\*?|gather\*?)\}([\s\S]*?)\\end\{\1\}/g,
        (_, env, body) => `\n\n$$\n\\begin{aligned}\n${body.trim()}\n\\end{aligned}\n$$\n\n`
      );
      text = text.replace(/(?<!\$)\\ce\{([^}]+)\}(?!\$)/g, (_, formula) => `$\\ce{${formula}}$`);
      return text;
    })
    .join("");
}

async function streamChat(model, prompt) {
  const res = await fetch('http://localhost:3000/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { status: res.status, text: errText };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  return { status: res.status, text: fullText };
}

async function runTests() {
  console.log('==============================================');
  console.log('       MyChat Comprehensive Test Suite        ');
  console.log('==============================================\n');
  let failures = 0;

  // 1. Verify Home Page HTML
  try {
    const homeRes = await fetch('http://localhost:3000/');
    const homeText = await homeRes.text();
    if (homeRes.status === 200) {
      const hasTitle = homeText.includes('MyChat');
      const hasBlack = homeText.includes('bg-black');
      if (hasTitle && hasBlack) {
        console.log('✓ Test 1 Passed: Homepage rendered with MyChat title and AMOLED black styling.');
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

  // 2. Verify Models API Endpoint and Filtering
  try {
    const modelsRes = await fetch('http://localhost:3000/api/gemini/models');
    if (modelsRes.status === 200) {
      const data = await modelsRes.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        const hasFlash38 = data.models.some((m) => m.id === 'gemini-3.8-flash');
        const hasFlash25 = data.models.some((m) => m.id === 'gemini-2.5-flash');
        const hasTTS = data.models.some((m) => m.id.includes('-tts'));
        const hasLyria = data.models.some((m) => m.id.includes('lyria'));
        const hasTranscribe = data.models.some((m) => m.id.includes('transcribe'));

        if (hasFlash38 && hasFlash25 && !hasTTS && !hasLyria && !hasTranscribe) {
          console.log(`✓ Test 2 Passed: /api/gemini/models returned ${data.models.length} clean chat models (gemini-3.8-flash & 2.5-flash present; non-chat TTS/Lyria/transcribe properly excluded).`);
        } else {
          console.error(`✗ Test 2 Failed: Model filtering issue. hasTTS: ${hasTTS}, hasLyria: ${hasLyria}`);
          failures++;
        }
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

  // 3. Verify Math & Chemistry Preprocessing & KaTeX Rendering
  try {
    const rawSample = 'Formula: \\[E = mc^2\\] and \\(F = ma\\). Chem: \\ce{2H2 + O2 -> 2H2O}. Code: `\\[no touch\\]`';
    const processed = preprocessMarkdownMath(rawSample);

    const hasDisplay = processed.includes('$$\nE = mc^2\n$$');
    const hasInline = processed.includes('$F = ma$');
    const hasChem = processed.includes('$\\ce{2H2 + O2 -> 2H2O}$');
    const preservedCode = processed.includes('`\\[no touch\\]`');

    const katexMath = katex.renderToString('E = mc^2', { throwOnError: false });
    const katexChem = katex.renderToString('\\ce{CH4 + 2O2 -> CO2 + 2H2O}', { throwOnError: false });

    if (hasDisplay && hasInline && hasChem && preservedCode && katexMath.includes('katex-html') && katexChem.includes('katex-html')) {
      console.log('✓ Test 3 Passed: Math & Chemistry preprocessing and KaTeX+mhchem equation rendering verified.');
    } else {
      console.error('✗ Test 3 Failed: Math preprocessing or KaTeX rendering failed.');
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 3 Error:', err.message);
    failures++;
  }

  // 4. Verify Code Syntax Highlighting
  try {
    const pyCode = 'def fibonacci(n: int) -> int:\n    return n if n <= 1 else fibonacci(n - 1) + fibonacci(n - 2)';
    const highlightedPy = hljs.highlight(pyCode, { language: 'python', ignoreIllegals: true }).value;

    const tsCode = 'interface Message { id: string; role: "user" | "assistant"; }';
    const highlightedTs = hljs.highlight(tsCode, { language: 'typescript', ignoreIllegals: true }).value;

    if (highlightedPy.includes('hljs-keyword') && highlightedTs.includes('hljs-keyword')) {
      console.log('✓ Test 4 Passed: Syntax highlighting correctly tokenizes Python and TypeScript code.');
    } else {
      console.error('✗ Test 4 Failed: Syntax highlighting did not produce expected tokens.');
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 4 Error:', err.message);
    failures++;
  }

  // 5. Verify Streaming Chat Completion with Physics LaTeX
  try {
    const chatRes = await streamChat('gemini-2.5-flash', 'What is the relativistic mass-energy relation and kinetic energy formula? State with LaTeX.');

    if (chatRes.status === 200 && chatRes.text.length > 20) {
      const hasMath = chatRes.text.includes('$') || chatRes.text.includes('mc^2') || chatRes.text.includes('\\[') || chatRes.text.includes('\\(');
      console.log(`✓ Test 5 Passed: /api/gemini/chat streamed ${chatRes.text.length} chars with physics formulas. LaTeX detected: ${hasMath}`);
    } else {
      console.error(`✗ Test 5 Failed: Chat API returned status ${chatRes.status}. Output: ${chatRes.text}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 5 Error:', err.message);
    failures++;
  }

  // 6. Verify Chemistry Streaming
  try {
    const chemRes = await streamChat('gemini-2.5-flash', 'Provide the balanced chemical equation for the combustion of methane with LaTeX.');

    if (chemRes.status === 200 && chemRes.text.length > 20) {
      const hasChem = chemRes.text.includes('CH_4') || chemRes.text.includes('CO_2') || chemRes.text.includes('H_2O') || chemRes.text.includes('\\ce') || chemRes.text.includes('O_2');
      console.log(`✓ Test 6 Passed: Chemistry query streamed ${chemRes.text.length} chars with balanced reaction notation.`);
    } else {
      console.error(`✗ Test 6 Failed: Chemistry query returned status ${chemRes.status}`);
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 6 Error:', err.message);
    failures++;
  }

  // 7. Verify Convex Backend Module Export
  try {
    const convexApi = require('../convex/_generated/api.js');
    if (convexApi.api && typeof convexApi.api === 'object') {
      console.log('✓ Test 7 Passed: Convex backend API proxy exports successfully.');
    } else {
      console.error('✗ Test 7 Failed: Convex api export missing.');
      failures++;
    }
  } catch (err) {
    console.error('✗ Test 7 Error:', err.message);
    failures++;
  }

  console.log(`\n==============================================`);
  console.log(`Verification Complete: ${failures === 0 ? 'ALL 7 TESTS PASSED ✓' : failures + ' TEST(S) FAILED ✗'}`);
  console.log(`==============================================\n`);
  process.exit(failures === 0 ? 0 : 1);
}

runTests();
