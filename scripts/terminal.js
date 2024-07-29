document.addEventListener("DOMContentLoaded", async () => {
  const terminal = document.getElementById("terminal");
  const input = document.getElementById("input");
  const label = document.getElementById("label");
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
        const labelValue = label.textContent;
        history.innerHTML += `<br><span class="command">${labelValue} ${inputValue}</span><br>`;

        if (server) {
          await fetchContent(input.value);
        } else {
          if (routes[input.value] !== undefined) {
            await fetchContent(routes[input.value]);
          } else {
            history.innerHTML += "Invalid command!<br>";
          }
        }

        input.value = "";
      }
    }
  });

  async function fetchContent(route) {
    await fetch(`/${route}`)
      .then(async (response) => {
        if (!response.ok) {
          history.innerHTML += "Invalid command!<br>";
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
