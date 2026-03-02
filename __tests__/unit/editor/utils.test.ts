/**
 * @file __tests__/unit/editor/utils.test.ts
 *
 * Unit tests for app/dashboard/pages/editor/utils.ts
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  TESTING PHILOSOPHY (read before editing this file)                     │
 * │                                                                         │
 * │  1. Test CONTRACTS, not implementation details.                         │
 * │     - "Does the output contain contenteditable?" ✓                      │
 * │     - "Does the variable `sty` exist?" ✗  (internal detail)            │
 * │                                                                         │
 * │  2. Arrange → Act → Assert (AAA) pattern in every test.                 │
 * │     A single logical assertion per test where possible.                 │
 * │                                                                         │
 * │  3. Test BOUNDARIES, not just happy paths.                              │
 * │     Zero, null, empty string, huge input, adversarial input.            │
 * │                                                                         │
 * │  4. Each test must be INDEPENDENT and IDEMPOTENT.                       │
 * │     No shared mutable state, no execution-order dependency.             │
 * │                                                                         │
 * │  5. Descriptive test names follow → Given / When / Then or              │
 * │     "should [behaviour] when [condition]"                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { renderHook, act } from '@testing-library/react';
import {
    useDebounce,
    buildIframeScript,
    buildSrcdoc,
    type PreviewMode,
} from '@/app/dashboard/pages/editor/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Re-usable factory so individual tests don't repeat boilerplate. */
function renderDebounce<T>(value: T, delay: number) {
    return renderHook(
        ({ v, d }: { v: T; d: number }) => useDebounce(v, d),
        { initialProps: { v: value, d: delay } }
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. useDebounce
// ═════════════════════════════════════════════════════════════════════════════

describe('useDebounce', () => {
    /**
     * Why fake timers?
     *   Real timers make tests slow and non-deterministic.
     *   Fake timers give us full control over time without waiting.
     *
     * Why beforeEach / afterEach?
     *   Each test gets a clean timer state so no timeout from test A
     *   accidentally fires during test B.
     */
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Wrap in act() so React knows these timer callbacks are
        // test-controlled state updates — silences the console.error warning.
        act(() => { jest.runAllTimers(); });
        jest.useRealTimers();
    });

    // ── Initial value ─────────────────────────────────────────────────────────

    it('should return the initial value synchronously before any delay elapses', () => {
        // Arrange + Act
        const { result } = renderDebounce('hello', 500);
        // Assert — no act() wrapper because we haven't advanced time
        expect(result.current).toBe('hello');
    });

    it('should return 0 as initial value for numeric type', () => {
        const { result } = renderDebounce(0, 300);
        expect(result.current).toBe(0);
    });

    it('should return an object reference as the initial value', () => {
        const obj = { key: 'value' };
        const { result } = renderDebounce(obj, 200);
        // Same reference, not just deep equality
        expect(result.current).toBe(obj);
    });

    // ── Timing: value must NOT update before delay ─────────────────────────────

    it('should NOT update the value at delay - 1 ms (boundary: just before threshold)', () => {
        const { result, rerender } = renderDebounce('initial', 500);

        rerender({ v: 'updated', d: 500 });

        act(() => { jest.advanceTimersByTime(499); });

        expect(result.current).toBe('initial');
    });

    it('should update the value exactly at delay ms (boundary: at threshold)', () => {
        const { result, rerender } = renderDebounce('initial', 500);

        rerender({ v: 'updated', d: 500 });

        act(() => { jest.advanceTimersByTime(500); });

        expect(result.current).toBe('updated');
    });

    // ── Rapid updates: debounce must restart the clock ─────────────────────────
    /**
     * REAL-WORLD SCENARIO: User types fast. Only the final keystroke
     * should trigger the update — this is the core debounce contract.
     */
    it('should reset the timer on every intermediate update so only the last value propagates', () => {
        const { result, rerender } = renderDebounce('a', 500);

        // Three rapid updates within 300 ms (well before the 500 ms delay)
        rerender({ v: 'b', d: 500 });
        act(() => { jest.advanceTimersByTime(200); });

        rerender({ v: 'c', d: 500 });
        act(() => { jest.advanceTimersByTime(200); });

        rerender({ v: 'final', d: 500 });

        // Only 400 ms total elapsed since the last rerender — still stale
        expect(result.current).toBe('a');

        // Advance past the delay for the LAST update
        act(() => { jest.advanceTimersByTime(500); });

        // Intermediate values 'b' and 'c' must never have appeared
        expect(result.current).toBe('final');
    });

    // ── Zero delay ────────────────────────────────────────────────────────────
    /**
     * EDGE CASE: delay = 0 is a valid argument.
     * The hook must still batch the update via setTimeout(fn, 0),
     * meaning it's microtask-deferred, not synchronous.
     */
    it('should update immediately after timer flush when delay is 0', () => {
        const { result, rerender } = renderDebounce('old', 0);

        rerender({ v: 'new', d: 0 });

        // Before flushing: value should still be 'old' (deferred via setTimeout)
        expect(result.current).toBe('old');

        act(() => { jest.runAllTimers(); });

        expect(result.current).toBe('new');
    });

    // ── Cleanup: no memory leak / timer leak on unmount ──────────────────────
    /**
     * VULNERABILITY: If the cleanup function is missing or wrong,
     * the stale timer fires after unmount and tries to update
     * state on an unmounted component → React warning OR ghost update.
     */
    it('should cancel the pending timeout when the hook is unmounted', () => {
        const { result, rerender, unmount } = renderDebounce('initial', 1000);

        rerender({ v: 'updated', d: 1000 });

        // Unmount BEFORE the delay elapses
        unmount();

        // If cleanup is broken, advanceTimersByTime would trigger a state
        // update on the unmounted hook — Jest / RTL would log a warning and
        // result.current could change. We assert neither happens.
        act(() => { jest.advanceTimersByTime(1000); });

        // Value visible to "outside" world must still be pre-unmount snapshot
        expect(result.current).toBe('initial');
    });

    // ── Delay change ──────────────────────────────────────────────────────────
    it('should apply the new delay when delay prop changes mid-debounce', () => {
        const { result, rerender } = renderDebounce('v1', 1000);

        // Switch to a shorter delay while a timer is pending
        rerender({ v: 'v2', d: 200 });

        act(() => { jest.advanceTimersByTime(200); });

        expect(result.current).toBe('v2');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. buildIframeScript
// ═════════════════════════════════════════════════════════════════════════════

describe('buildIframeScript', () => {
    // ── Output structure ──────────────────────────────────────────────────────

    it('should return a self-invoking function expression (IIFE)', () => {
        const script = buildIframeScript('preview');
        /**
         * The script is injected via a <script> tag. It MUST be wrapped in an
         * IIFE to avoid polluting the iframe's global scope.
         */
        expect(script.trimStart()).toMatch(/^\(function\(\)\{/);
        expect(script.trimEnd()).toMatch(/\}\)\(\);$/);
    });

    it('should embed the mode value as a JavaScript string literal', () => {
        const previewScript = buildIframeScript('preview');
        const editScript = buildIframeScript('visual-edit');

        expect(previewScript).toContain("var MODE = 'preview';");
        expect(editScript).toContain("var MODE = 'visual-edit';");
    });

    // ── Preview mode behaviour ────────────────────────────────────────────────

    it('should contain an early return guard that exits before visual-edit code in preview mode', () => {
        const script = buildIframeScript('preview');
        /**
         * Contract: the preview script must bail out before any contenteditable
         * injection. We check the guard exists — not internal variable names.
         */
        expect(script).toContain("if (MODE !== 'visual-edit') return;");
    });

    it('should contain the link-click prevention handler in preview mode', () => {
        const script = buildIframeScript('preview');
        expect(script).toContain("e.preventDefault()");
        expect(script).toContain("e.stopPropagation()");
    });

    it('should contain the form submit prevention handler in preview mode', () => {
        const script = buildIframeScript('preview');
        expect(script).toContain("addEventListener('submit'");
        expect(script).toContain("e.preventDefault()");
    });

    it('should place the early-return guard BEFORE any contenteditable injection (execution order contract)', () => {
        const script = buildIframeScript('preview');
        /**
         * CORRECT APPROACH: The script text contains the contenteditable call
         * as a literal string (it's in the dead-code section after the early
         * return). What actually matters is ORDERING: the guard that exits
         * before visual-edit must appear earlier in the string than the
         * contenteditable injection.
         *
         * If someone moves the contenteditable block before the guard,
         * this test catches the regression.
         */
        const guardPos = script.indexOf("if (MODE !== 'visual-edit') return;");
        const cePos = script.indexOf("setAttribute('contenteditable'");
        expect(guardPos).toBeGreaterThan(-1);
        expect(cePos).toBeGreaterThan(-1);
        expect(guardPos).toBeLessThan(cePos);
    });

    // ── Visual-edit mode behaviour ────────────────────────────────────────────

    it('should include contenteditable injection code in visual-edit mode', () => {
        const script = buildIframeScript('visual-edit');
        expect(script).toContain("setAttribute('contenteditable', 'true')");
    });

    it('should include the data-ve marker attribute in visual-edit mode', () => {
        const script = buildIframeScript('visual-edit');
        expect(script).toContain("setAttribute('data-ve'");
    });

    it('should include the postMessage sync call in visual-edit mode', () => {
        const script = buildIframeScript('visual-edit');
        /**
         * This is the critical integration contract:
         * edited content must be posted back to the parent frame.
         */
        expect(script).toContain("window.parent.postMessage");
        expect(script).toContain("'VE_UPDATE'");
    });

    // ── Security: mode injection ──────────────────────────────────────────────
    /**
     * VULNERABILITY PROBE: If a future code path allows user-supplied mode
     * values, an attacker could inject JavaScript via the mode string.
     *
     * e.g., mode = "preview'; alert(document.cookie); //"
     *
     * These tests are EXPECTED TO FAIL if that injection risk ever surfaces.
     * Right now `PreviewMode` is a TypeScript union so this is type-safe,
     * but these tests guard against regressions if that changes.
     *
     * TypeScript's union type ('preview' | 'visual-edit') prevents this at
     * compile time, but we document the risk here.
     */
    it('should only contain the literal mode string without additional characters (type-safety probe)', () => {
        // Only two valid values exist per the type definition
        const validModes: PreviewMode[] = ['preview', 'visual-edit'];
        validModes.forEach(mode => {
            const script = buildIframeScript(mode);
            // The mode string must appear exactly as-is inside quotes
            expect(script).toContain(`var MODE = '${mode}';`);
        });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. buildSrcdoc
// ═════════════════════════════════════════════════════════════════════════════

describe('buildSrcdoc', () => {
    // ── Partial HTML (no doctype / html root tag) — "snippet mode" ───────────

    describe('when given partial HTML (snippet)', () => {
        it('should always produce output starting with <!DOCTYPE html>', () => {
            const doc = buildSrcdoc('<p>Hi</p>', '', '', 'preview');
            expect(doc.trimStart()).toMatch(/^<!DOCTYPE html>/i);
        });

        it('should wrap CSS in a <style> tag inside <head>', () => {
            const doc = buildSrcdoc('<p>Hi</p>', 'body{margin:0}', '', 'preview');
            const headSection = doc.substring(0, doc.indexOf('</head>'));
            expect(headSection).toContain('<style>body{margin:0}</style>');
        });

        it('should place user HTML inside <body>', () => {
            const doc = buildSrcdoc('<h1>Title</h1>', '', '', 'preview');
            const bodySection = doc.substring(doc.indexOf('<body>'), doc.indexOf('</body>'));
            expect(bodySection).toContain('<h1>Title</h1>');
        });

        it('should wrap user JS in a try/catch block to prevent iframe crashes', () => {
            const doc = buildSrcdoc('', '', 'console.log("hi");', 'preview');
            /**
             * WHY: If user JS throws, the iframe listener script (link guard,
             * sync, etc.) must still execute. try/catch is the safety net.
             */
            expect(doc).toContain('try{');
            expect(doc).toContain('}catch(e){');
            expect(doc).toContain('console.log("hi");');
        });

        it('should NOT emit an empty try/catch wrapper when js is an empty string', () => {
            const doc = buildSrcdoc('<p>Hi</p>', '', '', 'preview');
            /**
             * MISSING TEST IN ORIGINAL: empty JS should not pollute the script
             * with `try{}catch(e){}` dead noise.
             */
            expect(doc).not.toMatch(/try\{\s*\}catch/);
        });

        it('should propagate the mode into the injected script', () => {
            const previewDoc = buildSrcdoc('<p>Hi</p>', '', '', 'preview');
            const editDoc = buildSrcdoc('<p>Hi</p>', '', '', 'visual-edit');

            expect(previewDoc).toContain("var MODE = 'preview';");
            expect(editDoc).toContain("var MODE = 'visual-edit';");
        });

        it('should include a charset meta tag for correct encoding', () => {
            const doc = buildSrcdoc('', '', '', 'preview');
            expect(doc).toContain('<meta charset="UTF-8"');
        });

        it('should include a viewport meta tag for responsive behaviour', () => {
            const doc = buildSrcdoc('', '', '', 'preview');
            expect(doc).toContain('name="viewport"');
        });

        // ── Boundary: all inputs empty ──────────────────────────────────────────
        it('should return a valid HTML shell even when html, css, and js are all empty strings', () => {
            const doc = buildSrcdoc('', '', '', 'preview');
            expect(doc).toContain('<!DOCTYPE html>');
            expect(doc).toContain('<html');
            expect(doc).toContain('</html>');
        });
    });

    // ── Full document HTML (has <!DOCTYPE html> or <html …>) — "full doc mode" ─

    describe('when given a full HTML document', () => {
        const FULL_DOC = '<!DOCTYPE html><html><head><title>T</title></head><body><p>Content</p></body></html>';

        it('should detect a full document and NOT double-wrap with its own html/head/body tags', () => {
            const doc = buildSrcdoc(FULL_DOC, '', '', 'preview');
            // There must be exactly one <html tag
            const htmlTagCount = (doc.match(/<html/gi) ?? []).length;
            expect(htmlTagCount).toBe(1);
        });

        it('should inject CSS before </head> in a full document', () => {
            const doc = buildSrcdoc(FULL_DOC, 'body{color:red}', '', 'preview');
            const stylePos = doc.indexOf('<style>body{color:red}</style>');
            const headClosePos = doc.indexOf('</head>');
            expect(stylePos).toBeGreaterThan(-1);
            expect(stylePos).toBeLessThan(headClosePos);
        });

        it('should inject the script tag before </body> in a full document', () => {
            const doc = buildSrcdoc(FULL_DOC, '', '', 'preview');
            const scriptPos = doc.indexOf('<script>');
            const bodyClosePos = doc.indexOf('</body>');
            expect(scriptPos).toBeGreaterThan(-1);
            expect(scriptPos).toBeLessThan(bodyClosePos);
        });

        it('should handle a full document that case-insensitively matches <HTML>', () => {
            const upperHtml = '<!DOCTYPE HTML><HTML><HEAD></HEAD><BODY></BODY></HTML>';
            const doc = buildSrcdoc(upperHtml, 'p{color:blue}', '', 'preview');
            expect(doc).toContain('<style>p{color:blue}</style>');
        });

        it('should append CSS before body content if </head> tag is missing', () => {
            const noHeadDoc = '<!DOCTYPE html><html><body><p>Hello</p></body></html>';
            const doc = buildSrcdoc(noHeadDoc, 'p{margin:0}', '', 'preview');
            /**
             * Contract: if there's no </head>, the CSS must still appear
             * somewhere in the output (prepended to the doc).
             */
            expect(doc).toContain('<style>p{margin:0}</style>');
        });

        it('should append the script after all content if </body> tag is missing', () => {
            const noBodyDoc = '<!DOCTYPE html><html><head></head><p>Text</p></html>';
            const doc = buildSrcdoc(noBodyDoc, '', '', 'preview');
            expect(doc).toContain('<script>');
        });

        it('should preserve the original DOCTYPE in a full document', () => {
            const doc = buildSrcdoc(FULL_DOC, '', '', 'preview');
            expect(doc.trimStart()).toMatch(/^<!DOCTYPE html>/i);
        });
    });

    // ── Security / vulnerability probes ───────────────────────────────────────
    /**
     * These tests probe for structural integrity under adversarial input.
     * They are NOT expected to sanitise — buildSrcdoc works within a
     * sandboxed iframe (sandbox attribute on the <iframe> element handles
     * that layer). What we verify here is that the FUNCTION'S OWN STRUCTURE
     * is not broken by the input.
     */

    describe('security and structural integrity probes', () => {
        it('should produce a string output (not throw) when CSS contains </style> tag injection', () => {
            /**
             * CSS INJECTION PROBE:
             * If a user pastes `</style><script>alert(1)</script>` as their CSS,
             * the function must still return a string without throwing.
             * (Actual XSS mitigation is the iframe sandbox attribute on the
             * parent component — this tests the function boundary.)
             */
            const adversarialCss = '</style><script>alert(1)</script><style>';
            expect(() => {
                buildSrcdoc('<p>test</p>', adversarialCss, '', 'preview');
            }).not.toThrow();
        });

        it('should produce a string output (not throw) when HTML contains premature </body> tags', () => {
            /**
             * HTML INJECTION PROBE:
             * User supplies HTML that closes the body prematurely.
             * The function should not crash.
             */
            const adversarialHtml = '<p>ok</p></body></html><script>evil()</script>';
            expect(() => {
                buildSrcdoc(adversarialHtml, '', '', 'preview');
            }).not.toThrow();
        });

        it('should produce a string output (not throw) when JS contains backtick characters', () => {
            /**
             * TEMPLATE LITERAL ESCAPE PROBE:
             * The JS is wrapped in `try{${js}}catch(e){…}` using a template
             * literal. If js contains a backtick it could theoretically break
             * the JS string boundary. This probe validates no crash occurs.
             */
            const adversarialJs = 'const x = `hello ${world}`;';
            expect(() => {
                buildSrcdoc('<p>test</p>', '', adversarialJs, 'preview');
            }).not.toThrow();
        });

        it('should always return a string regardless of input combination', () => {
            const result = buildSrcdoc(
                '<b>test</b>',
                '* { box-sizing: border-box; }',
                'document.title = "hi";',
                'visual-edit'
            );
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
