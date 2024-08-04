function command(text)
{
  return `
    <div class="shell">
      <span class="username">you</span>
      <span class="server-name-with-domain">@sefermirza.dev</span>
      :
      <span class="special-character">~</span>
      $&nbsp;
      <span class="command">${text}<span>
    </div>
  `
}

function invalidCommandMsg(command)
{
  return `<div>Invalid command!<br>To see valid commands try to say <strong class="command">${command}</strong></div>`
}

document.addEventListener("DOMContentLoaded", async () => {
  const terminal = document.getElementById("terminal");
  const input = document.getElementById("input");
  const history = document.getElementById("history");
  const routes = await fetchRoutes();
  const server = routes === undefined ? true : false;

  terminal.addEventListener("click", () => {
    input.focus();
  });

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (input.value != "") {
        const inputValue = input.value;
        if (inputValue == "cls") {
          history.innerHTML = "";
          input.value = "";
          return;
        }

        history.innerHTML += `${command(inputValue)}`;

        if (server) {
          await fetchContent(input.value);
        } else {
          if (routes[input.value] !== undefined) {
            await fetchContent(routes[input.value]);
          } else {
            history.innerHTML += invalidCommandMsg("help");
          }
        }

        terminal.scrollTo(0, terminal.scrollHeight);
        input.value = "";
      }
    }
  });

  async function fetchContent(route) {
    await fetch(`/${route}`)
      .then(async (response) => {
        if (!response.ok) {
          history.innerHTML += invalidCommandMsg("help");
          return;
        }
        var content = await response.text();
        history.innerHTML += content;
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

async function fetchRoutes() {
  try {
    const response = await fetch("/scripts/routes.json");
    if (!response.ok) {
      throw new Error(`Routes not found!`);
    }
    return await response.json();
  } catch (error) {
    console.warn(error);
  }
}
