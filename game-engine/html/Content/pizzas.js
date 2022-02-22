window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Pizzas = {
  "s001": {
    name: "Black Bunny",
    description: "Pizza desc here",
    type: PizzaTypes.spicy,
    src: "/nfts/300.png",
    icon: "/images/icons/wind.png",
    actions: [ "saucyStatus", "clumsyStatus", "damage1" ],
  },
  "2": {
    name: "2",
    description: "Pizza desc here",
    type: PizzaTypes.spicy,
    src: "/nfts/2.png",
    icon: "/images/icons/fire.png",
    actions: [ "saucyStatus", "clumsyStatus", "damage1" ],
  },
  "3": {
    name: "3",
    description: "Pizza desc here",
    type: PizzaTypes.spicy,
    src: "/nfts/3.png",
    icon: "/images/icons/water.png",
    actions: [ "saucyStatus", "clumsyStatus", "damage1" ],
  },
  "4": {
    name: "Ghost Warrior",
    description: "4",
    type: PizzaTypes.spicy,
    src: "/nfts/Ghost_warrior.png",
    icon: "/images/icons/moon.png",
    actions: [ "damage3", "damage4", "clumsyStatus" ],
  },
  "5": {
    name: "5",
    description: "5",
    type: PizzaTypes.spicy,
    src: "/nfts/5.png",
    icon: "/images/icons/moon.png",
    actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
  },
  "6": {
    name: "6",
    description: "6",
    type: PizzaTypes.spicy,
    src: "/nfts/6.png",
    icon: "/images/icons/thunder.png",
    actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
  },
  "v001": {
    name: "Call Me Kale",
    description: "Pizza desc here",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "f001": {
    name: "Portobello Express",
    description: "Pizza desc here",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  }
}