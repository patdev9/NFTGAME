window.Actions = {

  damage1: {
    name: "Rugpull!",
    description: "NOT SAFU",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10}
    ]
  },
  damage2: {
    name: "Shuriken",
    description: "Throw a shuriken on your opponent",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 10}
    ]
  },
  damage4: {
    name: "Rugpull!",
    description: "NOT SAFU",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 20}
    ]
  },
  damage3: {
    name: "Shuriken",
    description: "Throw a shuriken on your opponent",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "spin"},
      { type: "stateChange", damage: 20}
    ]
  },
  saucyStatus: {
    name: "Senzu",
    description: "Take the power of the beans",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } }
    ]
  },
  clumsyStatus: {
    name: "Spit",
    description: "Spit on your opponent",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 }, damage:15 },
      { type: "textMessage", text: "{TARGET} is slipping all around!"},
    ]
  },
  //Items
  // item_recoverStatus: {
  //   name: "Bandage",
  //   description: "Feeling fresh and warm",
  //   targetType: "friendly",
  //   success: [
  //     { type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
  //     { type: "stateChange", status: null },
  //     { type: "textMessage", text: "Feeling fresh!", },
  //   ]
  // },
  item_recoverHp: {
    name: "Bandage",
    targetType: "friendly",
    success: [
      { type:"textMessage", text: "{CASTER} sprinkles on some {ACTION}!", },
      { type:"stateChange", recover: 10, },
      { type:"textMessage", text: "{CASTER} recovers HP!", },
    ]
  },
}