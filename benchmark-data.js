// Benchmark results shown on kernel.html. The section stays hidden until
// `measured` is true: nothing on this page may be a number nobody measured.
//
// To publish results, run the protocol in README.md ("Benchmark"), then fill
// this in and set `measured: true`. Every value is a percentage (0–100) of
// the task set. Leave a tool's value `null` if it was not run.
window.THANATOS_BENCHMARK = {
  measured: false,
  date: null, // "2026-10-20"
  tasks: null, // number of tasks in the set
  runsPerTask: null, // repetitions per tool per task
  models: null, // e.g. "Claude Opus 5.5 for THANATOS and Claude Code; GPT-5.2 for Codex"
  source: null, // URL or path to the raw results
  metrics: [
    {
      id: "correct",
      label: "Tasks finished correctly",
      labelTh: "งานที่เสร็จและถูกต้อง",
      note: "Hidden acceptance tests pass on the final state.",
      noteTh: "ผ่าน acceptance test ที่ซ่อนไว้ เมื่อดูจากผลลัพธ์สุดท้าย",
      higherIsBetter: true,
      values: { thanatos: null, claude: null, codex: null },
    },
    {
      id: "false-done",
      label: "Said \"done\" while a test still failed",
      labelTh: "บอกว่า \"เสร็จ\" ทั้งที่ยังมี test ไม่ผ่าน",
      note: "Share of tasks where the tool reported completion and the hidden tests failed.",
      noteTh: "สัดส่วนของงานที่เครื่องมือรายงานว่าเสร็จ แต่ test ที่ซ่อนไว้ไม่ผ่าน",
      higherIsBetter: false,
      values: { thanatos: null, claude: null, codex: null },
    },
    {
      id: "regression",
      label: "Broke something outside the change",
      labelTh: "ทำให้ส่วนอื่นนอกจุดที่แก้พัง",
      note: "Share of tasks where a previously passing test failed afterwards.",
      noteTh: "สัดส่วนของงานที่ test ซึ่งเคยผ่านกลับไม่ผ่านหลังทำเสร็จ",
      higherIsBetter: false,
      values: { thanatos: null, claude: null, codex: null },
    },
  ],
};

// Shape preview only (kernel.html?benchmark=sample). These numbers are made
// up to show the layout and are stamped as such on the page. Never copy them
// into the object above.
window.THANATOS_BENCHMARK_SAMPLE = {
  correct: { thanatos: 80, claude: 60, codex: 55 },
  "false-done": { thanatos: 5, claude: 25, codex: 30 },
  regression: { thanatos: 10, claude: 20, codex: 25 },
};
