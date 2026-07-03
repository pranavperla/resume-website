const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- tf / py mode toggle ---------- */
const setMode = (function modeToggle() {
  const tabTf = document.getElementById("tab-tf");
  const tabPy = document.getElementById("tab-py");
  const winTitle = document.getElementById("win-title");
  const modeIndicator = document.getElementById("mode-indicator");

  function setMode(mode) {
    document.body.dataset.mode = mode;
    tabTf.classList.toggle("active", mode === "tf");
    tabPy.classList.toggle("active", mode === "py");
    tabTf.setAttribute("aria-selected", mode === "tf");
    tabPy.setAttribute("aria-selected", mode === "py");
    winTitle.textContent =
      mode === "py"
        ? "pranav@career: ~/pranav-perla — cat career.py — 80×24"
        : "pranav@career: ~/pranav-perla — terraform apply — 80×24";
    modeIndicator.textContent = mode === "py" ? "[py]" : "[tf]";
    try { localStorage.setItem("resume-mode", mode); } catch (e) {}
  }

  tabTf.addEventListener("click", () => setMode("tf"));
  tabPy.addEventListener("click", () => setMode("py"));

  let saved = null;
  try { saved = localStorage.getItem("resume-mode"); } catch (e) {}
  if (saved === "py") setMode("py");

  return setMode;
})();

/* ---------- boot sequence: type commands, then stream output lines ---------- */
(function boot() {
  const mode = document.body.dataset.mode;
  const activeVariant = mode === "py" ? ".v-py" : ".v-tf";
  const inactiveVariant = mode === "py" ? ".v-tf" : ".v-py";

  // the hidden mode's boot is pre-completed so toggling later shows it instantly
  document.querySelectorAll(`.boot ${inactiveVariant} .boot-line`).forEach((ln) => {
    ln.classList.add("shown");
    const t = ln.querySelector(".typed");
    if (t) t.textContent = t.dataset.type;
  });

  const lines = Array.from(document.querySelectorAll(`.boot ${activeVariant} .boot-line`));

  if (reduceMotion) {
    lines.forEach((ln) => {
      ln.classList.add("shown");
      const t = ln.querySelector(".typed");
      if (t) t.textContent = t.dataset.type;
    });
    return;
  }

  let i = 0;

  function next() {
    if (i >= lines.length) return;
    const ln = lines[i++];
    ln.classList.add("shown");
    const typedEl = ln.querySelector(".typed");

    if (typedEl) {
      // type the command character by character
      const cmd = typedEl.dataset.type;
      let c = 0;
      (function typeChar() {
        typedEl.textContent = cmd.slice(0, ++c);
        if (c < cmd.length) setTimeout(typeChar, 38 + Math.random() * 40);
        else setTimeout(next, 350);
      })();
    } else {
      setTimeout(next, 55 + Math.random() * 90);
    }
  }
  next();
})();

/* ---------- scroll reveal: plan output appears line by line ---------- */
(function reveal() {
  const lines = document.querySelectorAll(".step .ln");
  if (reduceMotion) {
    lines.forEach((ln) => ln.classList.add("shown"));
    return;
  }

  let queue = [];
  let draining = false;

  function drain() {
    if (!queue.length) { draining = false; return; }
    draining = true;
    queue.shift().classList.add("shown");
    setTimeout(drain, 26);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          queue.push(entry.target);
          observer.unobserve(entry.target);
        }
      }
      if (!draining && queue.length) drain();
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  lines.forEach((ln) => observer.observe(ln));
})();

/* ---------- tmux bar: clock + active window highlight ---------- */
(function tmux() {
  const clock = document.getElementById("clock");
  function tickClock() {
    const d = new Date();
    clock.textContent =
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  tickClock();
  setInterval(tickClock, 15000);

  const links = Array.from(document.querySelectorAll(".tmux-left a"));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          links.forEach((a, i) => a.classList.toggle("active", i === idx));
        }
      }
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );
  sections.forEach((s) => observer.observe(s));
})();

/* ---------- live prompt ---------- */
(function cli() {
  const input = document.getElementById("cli");
  const history = document.getElementById("cli-history");
  const promptRow = document.getElementById("prompt-row");
  const past = [];
  let pastIdx = -1;

  // focus the prompt when clicking anywhere in the terminal (unless selecting text)
  document.getElementById("term").addEventListener("click", () => {
    if (!window.getSelection().toString()) input.focus();
  });

  const BOOKS = [
    "Crime and Punishment          — Fyodor Dostoevsky",
    "Beyond Good and Evil          — Friedrich Nietzsche",
    "Notes from Underground        — Fyodor Dostoevsky",
    "Ordinary Men                  — Christopher Browning",
    "The Metamorphosis             — Franz Kafka",
  ];

  const COMMANDS = {
    help: () => [
      "available commands:",
      "  help          show this list",
      "  whoami        who is pranav?",
      "  entrupy       current role details",
      "  contact       email / phone",
      "  skills        dump the toolbox",
      "  books         cat ~/.reading_list",
      "  python        switch the resume to python",
      "  terraform     switch the resume back to terraform",
      "  terraform destroy   (careful)",
      "  clear         wipe the screen",
    ],
    whoami: () => [
      "pranav perla — mlops engineer, bangalore",
      "currently at Entrupy, shipping production ML systems and the infrastructure they run on.",
      "work spans visual search over 88M luxury-bag images, Anyscale/Ray serving, production RCAs and demo automation.",
      "first full-time role: Physarum.ai, Apr 2024 → Oct 2025 · EEE major, CSE minor (PES University '24)",
    ],
    entrupy: () => [
      "Entrupy — MLOps Engineer (Oct 1 2025 → present)",
      "  - Google Lens-style luxury-bag component search over an 88M-image company dataset",
      "  - fine-tuned YOLO detector + classifier models for detailed component-level search",
      "  - deployed multiple ML models on Anyscale / managed Ray for millions of requests",
      "  - fixed production model-serving errors, wrote RCAs, automated demo app deployments",
    ],
    contact: () => [
      "email = pranavperla21@gmail.com",
      "phone = +91 79813 72371",
    ],
    skills: () => [
      "python · fastapi · scikit-learn · streamlit · chainlit · gradio",
      "yolo fine-tuning · classifier fine-tuning · component-level visual search · large-scale image datasets",
      "anyscale · ray · model serving · production rca · demo app automation",
      "aws (ec2 ecs eks vpc iam alb rds dynamodb cloudwatch sagemaker route53 glue)",
      "gcp (dataflow vertex-ai workflow bigquery)",
      "terraform · docker · kubernetes · knative · airflow · github-actions",
      "mongodb · sql · qdrant · opensearch · prometheus · grafana",
    ],
    books: () => ["~/.reading_list:", ...BOOKS],
    ls: () => ["engineer/  jobs/  modules/  skills/  education/  outputs/"],
    clear: () => {
      history.innerHTML = "";
      return [];
    },
    sudo: () => ["pranav is not in the sudoers file. this incident will be reported."],
    exit: () => ["there is no escape. try `contact` instead."],
    "terraform destroy": () => [
      "Error: refusing to destroy resource \"career\".",
      "  This engineer has deletion protection enabled.",
      "  Hire instead: pranavperla21@gmail.com",
    ],
    "terraform apply": () => ["Apply complete! (you already scrolled through it)"],
    "terraform plan": () => ["No changes. Pranav's infrastructure is up-to-date."],
    python: () => {
      setMode("py");
      return ["switching interpreter... career.py loaded — scroll up to read it."];
    },
    python3: () => COMMANDS.python(),
    terraform: () => {
      setMode("tf");
      return ["switching back to HCL... terraform plan re-rendered — scroll up to read it."];
    },
  };

  function print(text, cls) {
    const div = document.createElement("div");
    div.className = "ln" + (cls ? " " + cls : "");
    div.textContent = text;
    history.appendChild(div);
  }

  function echoPrompt(cmd) {
    const div = document.createElement("div");
    div.className = "ln";
    const p = document.createElement("span");
    p.className = "prompt";
    p.textContent = "pranav@career:~$ ";
    div.appendChild(p);
    div.appendChild(document.createTextNode(cmd));
    history.appendChild(div);
  }

  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    echoPrompt(raw);
    if (!cmd) return;

    past.unshift(raw);
    pastIdx = -1;

    const handler = COMMANDS[cmd] || COMMANDS[cmd.split(/\s+/)[0]];
    if (handler) {
      const out = handler();
      out.forEach((l) => print(l, l.startsWith("Error") ? "err" : "cm2"));
    } else {
      print(`zsh: command not found: ${cmd} — try \`help\``, "err");
    }
    print(" ");
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
      promptRow.scrollIntoView({ block: "end", behavior: reduceMotion ? "auto" : "smooth" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (pastIdx < past.length - 1) input.value = past[++pastIdx] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pastIdx > 0) input.value = past[--pastIdx];
      else { pastIdx = -1; input.value = ""; }
    }
  });
})();
