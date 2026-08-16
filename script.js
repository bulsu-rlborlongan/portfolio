function sleep(ms) {

      return new Promise(
        resolve => setTimeout(resolve, ms)
      );

    }

    let shouldFollowTypewriter = false;

    let userStoppedFollow = false;

    const scrollControlKeys = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " "
    ];

    function stopTypewriterFollowByUser() {

      userStoppedFollow = true;

      shouldFollowTypewriter = false;

    }

    function watchTypewriterFollow() {

      shouldFollowTypewriter = true;

      userStoppedFollow = false;

      window.addEventListener(
        "wheel",
        stopTypewriterFollowByUser,
        {
          passive: true
        }
      );

      window.addEventListener(
        "touchstart",
        stopTypewriterFollowByUser,
        {
          passive: true
        }
      );

      window.addEventListener(
        "keydown",
        stopTypewriterFollowFromKey
      );

    }

    function stopTypewriterFollow() {

      shouldFollowTypewriter = false;

      window.removeEventListener(
        "wheel",
        stopTypewriterFollowByUser
      );

      window.removeEventListener(
        "touchstart",
        stopTypewriterFollowByUser
      );

      window.removeEventListener(
        "keydown",
        stopTypewriterFollowFromKey
      );

    }

    function stopTypewriterFollowFromKey(event) {

      if (
        scrollControlKeys.includes(event.key)
      ) {

        stopTypewriterFollowByUser();

      }

    }

    function followTypewriter(element) {

      if (
        !shouldFollowTypewriter ||
        userStoppedFollow ||
        !element
      ) {

        return;

      }

      const rect =
        element.getBoundingClientRect();

      const bottomEdge =
        window.innerHeight - 90;

      if (rect.bottom > bottomEdge) {

        window.scrollTo({
          top: Math.max(
            0,
            window.scrollY + rect.bottom - bottomEdge
          ),
          behavior: "smooth"
        });

      }

    }


    async function typeUnicodeArt(
      element,
      speed = 15
    ) {

      const originalArt =
        element.textContent
          .replace(/^\n/, "")
          .replace(/\n\s*$/, "")
          .replace(/^ {10}/gm, "");


      const height =
        element.getBoundingClientRect().height;


      /*
        Keep its space while the art
        is being printed so the hero
        doesn't jump around.
      */

      element.style.minHeight =
        height + "px";


      const lines =
        originalArt.split("\n");


      element.textContent = "";


      element.style.visibility =
        "visible";


      for (const line of lines) {

        element.textContent +=
          line + "\n";

        followTypewriter(element);

        await sleep(speed);

      }


      /*
        Original art is now restored,
        so the temporary height is no
        longer necessary.
      */

      element.style.minHeight = "";

    }

    async function typeText(
      element,
      speed = 20
    ) {

      /*
        Remember its original height
        before removing the text.
      */

      const originalHeight =
        element.getBoundingClientRect().height;


      element.style.minHeight =
        originalHeight + "px";


      /*
        Find every text node inside
        the element.
      */

      const walker =
        document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );


      const textNodes = [];


      while (walker.nextNode()) {

        const node =
          walker.currentNode;


        /*
          Convert unnecessary HTML
          whitespace/newlines into
          normal spaces.
        */

        const text =
          node.nodeValue
            .replace(/\s+/g, " ")
            .trim();


        if (text.length > 0) {

          textNodes.push({
            node: node,
            text: text
          });

        }

      }



      /*
        Remove all of the text while
        leaving elements such as
        <p> and <li> intact.
      */

      textNodes.forEach(item => {

        item.node.nodeValue = "";

      });



      /*
        Make the element visible.
      */

      element.style.visibility =
        "visible";


      element.classList.add(
        "type-cursor"
      );



      /*
        Type through every text node
        in order.
      */

      for (const item of textNodes) {


        for (
          let i = 0;
          i < item.text.length;
          i++
        ) {


          item.node.nodeValue +=
            item.text[i];

          if (
            i % 8 === 0 ||
            i === item.text.length - 1
          ) {

            followTypewriter(element);

          }

          let delay = speed;


          const character =
            item.text[i];


          if (
            character === "." ||
            character === "," ||
            character === ":" ||
            character === ";"
          ) {

            delay += 25;

          }


          await sleep(delay);

        }

      }

      element.classList.remove(
        "type-cursor"
      );


      element.style.minHeight = "";

    }


    async function startPage() {

      watchTypewriterFollow();


      /*
        STEP 1:
        Print Unicode art.
      */

      const art =
        document.querySelector(
          ".unicode-type"
        );


      if (art) {

        const artSpeed =
          Number(
            art.dataset.speed
          ) || 15;


        await typeUnicodeArt(
          art,
          artSpeed
        );

      }



      /*
        Small pause between portrait
        and your name.
      */

      await sleep(250);



      /*
        STEP 2:
        Start normal text queue.
      */

      const elements =
        document.querySelectorAll(
          ".typewriter"
        );



      for (const element of elements) {


        const speed =
          Number(
            element.dataset.speed
          ) || 20;



        await typeText(
          element,
          speed
        );

        /*
          Short terminal-style pause
          between outputs.
        */

        await sleep(100);

      }

      const shouldShowPrompt =
        shouldFollowTypewriter &&
        !userStoppedFollow;

      stopTypewriterFollow();

      showCommandPrompt(
        shouldShowPrompt
      );

    }

    const headingPrefixes =
      document.querySelectorAll(".heading-prefix");

    headingPrefixes.forEach((prefix, index) => {

      const number =
        String(index + 1).padStart(2, "0");

      prefix.textContent =
        `[${number} - `;
    });

    const themeToggle =
      document.querySelector(".theme-toggle");

    function setTheme(isLight) {

      document.body.classList.toggle(
        "light-mode",
        isLight
      );

      if (themeToggle) {

        themeToggle.setAttribute(
          "aria-pressed",
          String(isLight)
        );

        themeToggle.setAttribute(
          "aria-label",
          isLight ? "Switch to dark mode" : "Switch to light mode"
        );

      }

      localStorage.setItem(
        "theme",
        isLight ? "light" : "dark"
      );

    }

    setTheme(
      localStorage.getItem("theme") === "light"
    );

    if (themeToggle) {

      themeToggle.addEventListener("click", () => {

        setTheme(
          !document.body.classList.contains("light-mode")
        );

      });

    }

    const introTerminal =
      document.querySelector("#introTerminal");

    const siteShell =
      document.querySelector("#siteShell");

    const introForm =
      document.querySelector("#introForm");

    const introName =
      document.querySelector("#introName");

    const introConfirm =
      document.querySelector("#introConfirm");

    const introConfirmStep =
      document.querySelector("#introConfirmStep");

    const introOutput =
      document.querySelector("#introOutput");

    const introNamePrompt =
      document.querySelector("#introNamePrompt");

    const introConfirmPrompt =
      document.querySelector("#introConfirmPrompt");

    const introQuestion =
      document.querySelector("#introQuestion");

    const commandForm =
      document.querySelector("#contactForm");

    const commandStep =
      document.querySelector("#commandStep");

    const sectionCommand =
      document.querySelector("#sectionCommand");

    const commandOutput =
      document.querySelector("#commandOutput");

    const commandPrompt =
      document.querySelector("#commandPrompt");

    const terminalInputs =
      document.querySelectorAll(".terminal-form input");

    let visitorDisplayName = "visitor";

    let pageAnimated = false;

    let introNoStage = 0;

    let activeTerminalRow = null;

    function getPromptName(name) {

      return name
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "visitor";

    }

    function updateTerminalInputWidth(input) {

      input.style.setProperty(
        "--input-width",
        `${Math.max(input.value.length, 1)}ch`
      );

    }

    function setActiveTerminalRow(input) {

      const row =
        input.closest(".terminal-row");

      if (
        activeTerminalRow &&
        activeTerminalRow !== row &&
        activeTerminalRow !== commandStep
      ) {

        activeTerminalRow.classList.remove(
          "cursor-active"
        );

      }

      activeTerminalRow = row;

      if (activeTerminalRow) {

        activeTerminalRow.classList.add(
          "cursor-active"
        );

      }

    }

    terminalInputs.forEach(input => {

      updateTerminalInputWidth(input);

      input.addEventListener("input", () => {

        updateTerminalInputWidth(input);

      });

      input.addEventListener("focus", () => {

        updateTerminalInputWidth(input);

        setActiveTerminalRow(input);

      });

      const row =
        input.closest(".terminal-row");

      if (row) {

        row.addEventListener("click", () => {

          input.focus();

        });

      }

    });

    function setVisitorName() {

      const name =
        introName.value.trim();

      if (!name) {

        return false;

      }

      visitorDisplayName =
        getPromptName(name);

      introOutput.textContent =
        `hello ${name}.`;

      introNamePrompt.textContent =
        `${visitorDisplayName}:~$`;

      introConfirmPrompt.textContent =
        `${visitorDisplayName}:~$`;

      introConfirmStep.classList.add(
        "show"
      );

      introConfirm.focus();

      return true;

    }

    function setIntroQuestion(text) {

      introQuestion.textContent =
        text;

      introConfirm.value = "";

      introConfirm.focus();

    }

    async function runIntroChoice() {

      if (!setVisitorName()) {

        return;

      }

      const answer =
        introConfirm.value.trim().toLowerCase();

      if (answer === "y" || answer === "yes") {

        if (introNoStage === 1) {

          introNoStage = 2;

          setIntroQuestion(
            "are you really sure? (Y/N)"
          );

          return;

        }

        if (introNoStage === 2) {

          introNoStage = 0;

          introOutput.textContent =
            "okay :<";

          setIntroQuestion(
            "Would you like to know me now? (Y/N)"
          );

          return;

        }

        introTerminal.classList.add(
          "hide"
        );

        siteShell.classList.add(
          "show"
        );

        window.scrollTo(
          0,
          0
        );

        await startPage();

        return;

      }

      if (answer === "n" || answer === "no") {

        if (introNoStage === 0) {

          introNoStage = 1;

          setIntroQuestion(
            "are you sure? (Y/N)"
          );

          return;

        }

        if (introNoStage > 0) {

          introNoStage = 0;

          introOutput.textContent =
            "then let's try again.";

          setIntroQuestion(
            "Would you like to know me now? (Y/N)"
          );

          return;

        }

        return;

      }

      introOutput.textContent =
        "please type y or n.";

    }

    function showCommandPrompt(
      shouldScroll = true
    ) {

      pageAnimated = true;

      if (commandPrompt) {

        commandPrompt.textContent =
          `${visitorDisplayName}:~$`;

      }

      commandStep.classList.add(
        "show"
      );

      commandStep.classList.add(
        "cursor-active"
      );

      setActiveTerminalRow(
        sectionCommand
      );

      if (shouldScroll) {

        commandStep.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

      sectionCommand.focus();

    }

    function goToSection(command) {

      const targetMap = {
        about: "about",
        projects: "projects",
        project: "projects",
        experience: "experience",
        tech: "tech-stack",
        stack: "tech-stack",
        "tech stack": "tech-stack",
        certifications: "certifications",
        certification: "certifications",
        terminal: "terminal",
        contact: "terminal",
        home: "siteShell",
        top: "siteShell"
      };

      const search =
        command.trim().toLowerCase();

      const sectionId =
        targetMap[search];

      const targetId =
        sectionId;

      if (!targetId) {

        commandOutput.textContent =
          "section not found. try about, projects, experience, tech, or certifications.";

        return;

      }

      const section =
        document.querySelector(`#${targetId}`);

      if (section) {

        commandOutput.textContent =
          `opening ${targetId}.`;

        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }

    if (introName) {

      introName.focus();

      introName.addEventListener("keydown", event => {

        if (event.key === "Enter") {

          event.preventDefault();

          setVisitorName();

        }

      });

    }

    if (introConfirm) {

      introConfirm.addEventListener("keydown", event => {

        if (event.key === "Enter") {

          event.preventDefault();

          runIntroChoice();

        }

      });

    }

    if (introForm) {

      introForm.addEventListener("submit", event => {

        event.preventDefault();

        runIntroChoice();

      });

    }

    if (sectionCommand) {

      sectionCommand.addEventListener("keydown", event => {

        if (event.key === "Enter") {

          event.preventDefault();

          if (!pageAnimated) {

            return;

          }

          goToSection(
            sectionCommand.value
          );

          sectionCommand.value = "";

        }

      });

    }
