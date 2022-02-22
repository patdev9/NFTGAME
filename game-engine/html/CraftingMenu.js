class CraftingMenu {
  constructor({ pizzas, onComplete}) {
    this.pizzas = pizzas;
    this.onComplete = onComplete;
  }

  getOptions() {
    return [{ label: 'Create room',
      description: 'Create room',
      handler: () => {
        this.close();
        
      }},
      { label: 'Join room',
      description: 'Join room',
      handler: () => {
        this.close();
      }},
      { label: 'Quit',
      description: 'Quit',
      handler: () => {
        this.close();
      }}
    ]
    }
 
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("CraftingMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Online PVP</h2>
    `)
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }


  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element)
    this.keyboardMenu.setOptions(this.getOptions())

    container.appendChild(this.element);
  }
}