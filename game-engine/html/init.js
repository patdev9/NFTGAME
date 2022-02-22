(async function ()  {

  const overworld = await new Overworld({
    element: document.querySelector(".game-container")
  });
  overworld.init();

})();