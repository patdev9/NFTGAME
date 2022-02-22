class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior (if they are standing)
    Object.values(this.gameObjects).forEach(object => {
      const current = object.behaviorLoop[object.behaviorLoopIndex];
      if (current && current.type === "stand") {
        object.doBehaviorEvent(this);
      }
    })

  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/PXL_Lower.png",
    upperSrc: "/images/maps/PXL_Highier.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(22),
        y: utils.withGrid(16),
      }),
      // npcA: new Person({
      //   x: utils.withGrid(9),
      //   y: utils.withGrid(9),
      //   src: "/images/characters/people/npc1.png",
      //   behaviorLoop: [
      //     { type: "walk", direction: "left", },
      //     { type: "walk", direction: "down", },
      //     { type: "walk", direction: "right", },
      //     { type: "walk", direction: "up", },
      //     //{ type: "stand", direction: "up", time: 400, },
      //   ],
      //   talking: [
      //     {
      //       required: ["TALKED_TO_ERIO"],
      //       events: [
      //         { type: "textMessage", text: "Isn't Erio the coolest?", faceHero: "npcA" },
      //       ]
      //     },
      //     {
      //       events: [
      //         { type: "textMessage", text: "I'm going to crush you!", faceHero: "npcA" },
      //         { type: "battle", enemyId: "beth" },
      //         { type: "addStoryFlag", flag: "DEFEATED_BETH"},
      //         { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "npcA" },
      //         { type: "textMessage", text: "Go away!"},
      //         { who: "npcB", type: "walk",  direction: "up" },
      //       ]
      //     }
      //   ]
      // }),
      // npcC: new Person({
      //   x: utils.withGrid(4),
      //   y: utils.withGrid(8),
      //   src: "/images/characters/people/npc1.png",
      //   behaviorLoop: [
      //     { type: "stand", direction: "left", time: 500, },
      //     { type: "stand", direction: "down", time: 500, },
      //     { type: "stand", direction: "right", time: 500, },
      //     { type: "stand", direction: "up", time: 500, },
      //   ],
      // }),
      // npcB: new Person({
      //   x: utils.withGrid(8),
      //   y: utils.withGrid(5),
      //   src: "/images/characters/people/erio.png",
      //   talking: [
      //     {
      //       events: [
      //         { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
      //         { type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
      //         //{ type: "battle", enemyId: "erio" }
      //       ]
      //     }
      //   ]
      //   // behaviorLoop: [
      //   //   { type: "walk",  direction: "left" },
      //   //   { type: "stand",  direction: "up", time: 800 },
      //   //   { type: "walk",  direction: "up" },
      //   //   { type: "walk",  direction: "right" },
      //   //   { type: "walk",  direction: "down" },
      //   // ]
      // }),
      // pizzaStone: new PizzaStone({
      //   x: utils.withGrid(2),
      //   y: utils.withGrid(7),
      //   storyFlag: "USED_PIZZA_STONE",
      //   pizzas: ["v001", "f001"],
      // }),
    },
    walls: {
      [utils.asGridCoord(39,27)] : true,
      [utils.asGridCoord(40,27)] : true,
      [utils.asGridCoord(40,24)] : true,
      [utils.asGridCoord(39,24)] : true,
      [utils.asGridCoord(38,24)] : true,
      [utils.asGridCoord(37,24)] : true,
      [utils.asGridCoord(36,24)] : true,
      [utils.asGridCoord(35,24)] : true,
      [utils.asGridCoord(35,23)] : true,
      [utils.asGridCoord(36,23)] : true,
      [utils.asGridCoord(36,22)] : true,
      [utils.asGridCoord(37,22)] : true,
      [utils.asGridCoord(37,21)] : true,
      [utils.asGridCoord(36,20)] : true,
      [utils.asGridCoord(35,20)] : true,
      [utils.asGridCoord(34,20)] : true,
      [utils.asGridCoord(33,20)] : true,
      [utils.asGridCoord(32,17)] : true,
      [utils.asGridCoord(32,18)] : true,
      [utils.asGridCoord(32,19)] : true,
      [utils.asGridCoord(32,20)] : true,
      [utils.asGridCoord(32,19)] : true,
      [utils.asGridCoord(32,18)] : true,
      [utils.asGridCoord(32,17)] : true,
      [utils.asGridCoord(39,13)] : true,
      [utils.asGridCoord(39,14)] : true,
      [utils.asGridCoord(39,15)] : true,
      [utils.asGridCoord(38,15)] : true,
      [utils.asGridCoord(37,15)] : true,
      [utils.asGridCoord(36,15)] : true,
      [utils.asGridCoord(35,15)] : true,
      [utils.asGridCoord(34,15)] : true,
      [utils.asGridCoord(33,15)] : true,
      [utils.asGridCoord(33,17)] : true,
      [utils.asGridCoord(33,16)] : true,
      [utils.asGridCoord(33,15)] : true,
      [utils.asGridCoord(33,14)] : true,
      [utils.asGridCoord(33,13)] : true,
      [utils.asGridCoord(33,12)] : true,
      [utils.asGridCoord(34,12)] : true,
      [utils.asGridCoord(35,12)] : true,
      [utils.asGridCoord(36,12)] : true,
      [utils.asGridCoord(37,12)] : true,
      [utils.asGridCoord(38,12)] : true,
      [utils.asGridCoord(39,12)] : true,
      [utils.asGridCoord(39,13)] : true,
      [utils.asGridCoord(40,13)] : true,
      [utils.asGridCoord(41,13)] : true,
      [utils.asGridCoord(42,13)] : true,
      [utils.asGridCoord(43,13)] : true,
      [utils.asGridCoord(43,12)] : true,
      [utils.asGridCoord(43,11)] : true,
      [utils.asGridCoord(45,11)] : true,
      [utils.asGridCoord(46,11)] : true,
      [utils.asGridCoord(46,10)] : true,
      [utils.asGridCoord(46,9)] : true,
      [utils.asGridCoord(47,8)] : true,
      [utils.asGridCoord(47,7)] : true,
      [utils.asGridCoord(47,6)] : true,
      [utils.asGridCoord(47,5)] : true,
      [utils.asGridCoord(47,4)] : true,
      [utils.asGridCoord(47,3)] : true,
      [utils.asGridCoord(47,2)] : true,
      [utils.asGridCoord(46,2)] : true,
      [utils.asGridCoord(45,2)] : true,
      [utils.asGridCoord(44,2)] : true,
      [utils.asGridCoord(43,2)] : true,
      [utils.asGridCoord(42,2)] : true,
      [utils.asGridCoord(41,2)] : true,
      [utils.asGridCoord(40,2)] : true,
      [utils.asGridCoord(39,2)] : true,
      [utils.asGridCoord(38,2)] : true,
      [utils.asGridCoord(37,2)] : true,
      [utils.asGridCoord(36,2)] : true,
      [utils.asGridCoord(36,3)] : true,
      [utils.asGridCoord(36,4)] : true,
      [utils.asGridCoord(35,4)] : true,
      [utils.asGridCoord(34,4)] : true,
      [utils.asGridCoord(34,3)] : true,
      [utils.asGridCoord(34,2)] : true,
      [utils.asGridCoord(33,2)] : true,
      [utils.asGridCoord(32,3)] : true,
      [utils.asGridCoord(32,4)] : true,
      [utils.asGridCoord(32,5)] : true,
      [utils.asGridCoord(32,6)] : true,
      [utils.asGridCoord(31,6)] : true,
      [utils.asGridCoord(30,6)] : true,
      [utils.asGridCoord(29,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(26,6)] : true,
      [utils.asGridCoord(25,6)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(25,4)] : true,
      [utils.asGridCoord(25,3)] : true,
      [utils.asGridCoord(26,2)] : true,
      [utils.asGridCoord(25,2)] : true,
      [utils.asGridCoord(24,2)] : true,
      [utils.asGridCoord(23,2)] : true,
      [utils.asGridCoord(22,2)] : true,
      [utils.asGridCoord(21,2)] : true,
      [utils.asGridCoord(20,2)] : true,
      [utils.asGridCoord(19,2)] : true,
      [utils.asGridCoord(18,2)] : true,
      [utils.asGridCoord(17,2)] : true,
      [utils.asGridCoord(16,2)] : true,
      [utils.asGridCoord(15,2)] : true,
      [utils.asGridCoord(15,3)] : true,
      [utils.asGridCoord(15,4)] : true,
      [utils.asGridCoord(15,5)] : true,
      [utils.asGridCoord(15,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,

// bas
[utils.asGridCoord(0,38)] : true,
[utils.asGridCoord(1,38)] : true,
[utils.asGridCoord(2,38)] : true,
[utils.asGridCoord(3,38)] : true,
[utils.asGridCoord(4,38)] : true,
[utils.asGridCoord(5,38)] : true,
[utils.asGridCoord(6,38)] : true,
[utils.asGridCoord(7,38)] : true,
[utils.asGridCoord(8,38)] : true,
[utils.asGridCoord(9,38)] : true,
[utils.asGridCoord(10,38)] : true,
[utils.asGridCoord(11,38)] : true,
[utils.asGridCoord(12,38)] : true,
[utils.asGridCoord(13,38)] : true,
[utils.asGridCoord(14,38)] : true,
[utils.asGridCoord(15,38)] : true,
[utils.asGridCoord(16,38)] : true,
[utils.asGridCoord(17,38)] : true,
[utils.asGridCoord(18,38)] : true,
[utils.asGridCoord(19,38)] : true,
[utils.asGridCoord(20,38)] : true,
[utils.asGridCoord(21,38)] : true,
[utils.asGridCoord(22,38)] : true,
[utils.asGridCoord(23,38)] : true,
[utils.asGridCoord(24,38)] : true,
[utils.asGridCoord(25,38)] : true,
[utils.asGridCoord(26,38)] : true,
[utils.asGridCoord(27,38)] : true,
[utils.asGridCoord(28,38)] : true,
[utils.asGridCoord(29,38)] : true,
[utils.asGridCoord(30,38)] : true,
[utils.asGridCoord(31,38)] : true,
[utils.asGridCoord(32,38)] : true,
[utils.asGridCoord(33,38)] : true,
[utils.asGridCoord(34,38)] : true,
[utils.asGridCoord(35,38)] : true,
[utils.asGridCoord(36,38)] : true,
[utils.asGridCoord(37,38)] : true,
[utils.asGridCoord(38,38)] : true,
[utils.asGridCoord(39,38)] : true,
[utils.asGridCoord(40,38)] : true,
[utils.asGridCoord(41,38)] : true,
[utils.asGridCoord(42,38)] : true,
[utils.asGridCoord(43,38)] : true,
[utils.asGridCoord(44,38)] : true,
[utils.asGridCoord(45,38)] : true,
[utils.asGridCoord(46,38)] : true,

//bas haut 
[utils.asGridCoord(14,37)] : true,
[utils.asGridCoord(14,36)] : true,
[utils.asGridCoord(14,35)] : true,
[utils.asGridCoord(14,34)] : true,
[utils.asGridCoord(14,33)] : true,
[utils.asGridCoord(14,32)] : true,
[utils.asGridCoord(14,31)] : true,
[utils.asGridCoord(14,30)] : true,
[utils.asGridCoord(14,29)] : true,
[utils.asGridCoord(14,28)] : true,
[utils.asGridCoord(14,27)] : true,
[utils.asGridCoord(15,27)] : true,
[utils.asGridCoord(16,27)] : true,
[utils.asGridCoord(17,27)] : true,
[utils.asGridCoord(18,27)] : true,
[utils.asGridCoord(18,26)] : true,
[utils.asGridCoord(18,25)] : true,
[utils.asGridCoord(18,24)] : true,
[utils.asGridCoord(18,23)] : true,
[utils.asGridCoord(18,22)] : true,
[utils.asGridCoord(18,21)] : true,
[utils.asGridCoord(17,21)] : true,
[utils.asGridCoord(16,21)] : true,
[utils.asGridCoord(15,21)] : true,
[utils.asGridCoord(14,21)] : true,
[utils.asGridCoord(13,21)] : true,
[utils.asGridCoord(12,21)] : true,
[utils.asGridCoord(11,21)] : true,
[utils.asGridCoord(10,21)] : true,
[utils.asGridCoord(9,21)] : true,
[utils.asGridCoord(8,21)] : true,
[utils.asGridCoord(7,21)] : true,
[utils.asGridCoord(6,21)] : true,
[utils.asGridCoord(5,21)] : true,
[utils.asGridCoord(5,20)] : true,
[utils.asGridCoord(5,19)] : true,
[utils.asGridCoord(5,18)] : true,
[utils.asGridCoord(5,17)] : true,
[utils.asGridCoord(5,16)] : true,
[utils.asGridCoord(5,15)] : true,
[utils.asGridCoord(5,14)] : true,
[utils.asGridCoord(6,14)] : true,
[utils.asGridCoord(7,14)] : true,
[utils.asGridCoord(8,14)] : true,
[utils.asGridCoord(9,14)] : true,
[utils.asGridCoord(10,14)] : true,
[utils.asGridCoord(11,14)] : true,
[utils.asGridCoord(12,14)] : true,
[utils.asGridCoord(13,14)] : true,
[utils.asGridCoord(14,14)] : true,
[utils.asGridCoord(15,14)] : true,
[utils.asGridCoord(16,14)] : true,
[utils.asGridCoord(17,14)] : true,
[utils.asGridCoord(17,13)] : true,
[utils.asGridCoord(17,12)] : true,
[utils.asGridCoord(17,11)] : true,
[utils.asGridCoord(17,10)] : true,
[utils.asGridCoord(17,9)] : true,
[utils.asGridCoord(17,8)] : true,
[utils.asGridCoord(17,7)] : true,
[utils.asGridCoord(17,6)] : true,
[utils.asGridCoord(16,6)] : true,



      [utils.asGridCoord(40,37)] : true,
[utils.asGridCoord(40,36)] : true,
[utils.asGridCoord(40,35)] : true,
[utils.asGridCoord(40,34)] : true,
[utils.asGridCoord(40,33)] : true,
[utils.asGridCoord(40,32)] : true,
[utils.asGridCoord(40,32)] : true,
[utils.asGridCoord(41,32)] : true,
[utils.asGridCoord(42,32)] : true,
[utils.asGridCoord(43,32)] : true,
[utils.asGridCoord(43,33)] : true,
[utils.asGridCoord(43,34)] : true,
[utils.asGridCoord(44,34)] : true,
[utils.asGridCoord(45,34)] : true,
[utils.asGridCoord(46,34)] : true,
[utils.asGridCoord(47,34)] : true,
[utils.asGridCoord(48,34)] : true,
[utils.asGridCoord(48,33)] : true,
[utils.asGridCoord(48,32)] : true,
[utils.asGridCoord(49,32)] : true,
[utils.asGridCoord(50,32)] : true,
[utils.asGridCoord(51,32)] : true,
[utils.asGridCoord(52,32)] : true,
[utils.asGridCoord(53,31)] : true,
[utils.asGridCoord(54,31)] : true,
[utils.asGridCoord(55,31)] : true,
[utils.asGridCoord(56,31)] : true,
[utils.asGridCoord(56,30)] : true,
[utils.asGridCoord(56,29)] : true,
[utils.asGridCoord(57,28)] : true,
[utils.asGridCoord(58,28)] : true,
[utils.asGridCoord(59,28)] : true,
[utils.asGridCoord(60,28)] : true,
[utils.asGridCoord(61,28)] : true,
[utils.asGridCoord(61,27)] : true,
[utils.asGridCoord(62,26)] : true,
[utils.asGridCoord(63,26)] : true,
[utils.asGridCoord(64,26)] : true,
[utils.asGridCoord(65,26)] : true,
[utils.asGridCoord(66,26)] : true,
[utils.asGridCoord(67,26)] : true,
[utils.asGridCoord(67,25)] : true,
[utils.asGridCoord(67,24)] : true,
[utils.asGridCoord(67,23)] : true,
[utils.asGridCoord(67,22)] : true,
[utils.asGridCoord(67,21)] : true,
[utils.asGridCoord(67,22)] : true,
[utils.asGridCoord(67,20)] : true,
[utils.asGridCoord(67,19)] : true,
[utils.asGridCoord(67,18)] : true,
[utils.asGridCoord(67,17)] : true,
[utils.asGridCoord(67,16)] : true,
[utils.asGridCoord(67,15)] : true,


[utils.asGridCoord(66,15)] : true,
[utils.asGridCoord(65,15)] : true,
[utils.asGridCoord(64,15)] : true,
[utils.asGridCoord(63,15)] : true,
[utils.asGridCoord(62,15)] : true,
[utils.asGridCoord(61,15)] : true,
[utils.asGridCoord(61,14)] : true,
[utils.asGridCoord(61,13)] : true,
[utils.asGridCoord(60,13)] : true,
[utils.asGridCoord(60,12)] : true,
[utils.asGridCoord(60,11)] : true,
[utils.asGridCoord(59,11)] : true,
[utils.asGridCoord(59,10)] : true,
[utils.asGridCoord(58,10)] : true,
[utils.asGridCoord(58,9)] : true,
[utils.asGridCoord(57,9)] : true,
[utils.asGridCoord(57,8)] : true,
[utils.asGridCoord(57,7)] : true,
[utils.asGridCoord(56,7)] : true,

//mini cabane

[utils.asGridCoord(55,7)] : true,
[utils.asGridCoord(55,6)] : true,
[utils.asGridCoord(55,5)] : true,
[utils.asGridCoord(54,5)] : true,
[utils.asGridCoord(53,5)] : true,
[utils.asGridCoord(53,6)] : true,
[utils.asGridCoord(53,7)] : true,
[utils.asGridCoord(52,7)] : true,


// ANIS 
[utils.asGridCoord(51,7)] : true,
[utils.asGridCoord(51,8)] : true,
[utils.asGridCoord(51,9)] : true,
[utils.asGridCoord(51,10)] : true,
[utils.asGridCoord(51,11)] : true,
[utils.asGridCoord(52,11)] : true,
[utils.asGridCoord(52,12)] : true,
[utils.asGridCoord(53,12)] : true,
[utils.asGridCoord(53,13)] : true,
[utils.asGridCoord(53,14)] : true,
[utils.asGridCoord(53,15)] : true,
[utils.asGridCoord(53,16)] : true,
[utils.asGridCoord(52,16)] : true,
[utils.asGridCoord(52,17)] : true,
[utils.asGridCoord(52,18)] : true,
[utils.asGridCoord(52,19)] : true,
[utils.asGridCoord(52,20)] : true,
[utils.asGridCoord(51,20)] : true,
[utils.asGridCoord(51,21)] : true,
[utils.asGridCoord(50,21)] : true,
[utils.asGridCoord(49,21)] : true,
[utils.asGridCoord(48,21)] : true,
[utils.asGridCoord(47,21)] : true,

[utils.asGridCoord(47,20)] : true,
[utils.asGridCoord(46,20)] : true,
[utils.asGridCoord(45,20)] : true,
[utils.asGridCoord(44,20)] : true,

[utils.asGridCoord(44,19)] : true,
[utils.asGridCoord(44,18)] : true,
[utils.asGridCoord(44,17)] : true,
[utils.asGridCoord(44,16)] : true,
[utils.asGridCoord(44,15)] : true,
[utils.asGridCoord(44,14)] : true,
[utils.asGridCoord(44,13)] : true,
[utils.asGridCoord(44,12)] : true,

[utils.asGridCoord(45,12)] : true,
[utils.asGridCoord(45,11)] : true,
[utils.asGridCoord(46,11)] : true,
[utils.asGridCoord(46,10)] : true,
[utils.asGridCoord(46,9)] : true,
[utils.asGridCoord(46,8)] : true,

[utils.asGridCoord(45,8)] : true,
[utils.asGridCoord(44,8)] : true,
[utils.asGridCoord(43,8)] : true,

[utils.asGridCoord(43,9)] : true,

[utils.asGridCoord(42,9)] : true,
[utils.asGridCoord(41,9)] : true,
[utils.asGridCoord(40,9)] : true,

[utils.asGridCoord(40,10)] : true,

[utils.asGridCoord(39,10)] : true,
[utils.asGridCoord(38,10)] : true,
[utils.asGridCoord(37,10)] : true,

[utils.asGridCoord(37,11)] : true,

[utils.asGridCoord(36,11)] : true,
[utils.asGridCoord(35,11)] : true,
[utils.asGridCoord(34,11)] : true,

//mini lac

[utils.asGridCoord(26,14)] : true,
[utils.asGridCoord(27,14)] : true,
[utils.asGridCoord(28,14)] : true,
[utils.asGridCoord(28,13)] : true,
[utils.asGridCoord(29,13)] : true,
[utils.asGridCoord(30,13)] : true,
[utils.asGridCoord(31,13)] : true,
[utils.asGridCoord(31,14)] : true,
[utils.asGridCoord(32,14)] : true,
[utils.asGridCoord(33,15)] : true,
[utils.asGridCoord(33,16)] : true,
[utils.asGridCoord(34,16)] : true,
[utils.asGridCoord(35,16)] : true,
[utils.asGridCoord(36,16)] : true,
[utils.asGridCoord(37,16)] : true,
[utils.asGridCoord(37,17)] : true,
[utils.asGridCoord(37,18)] : true,
[utils.asGridCoord(37,19)] : true,
[utils.asGridCoord(36,19)] : true,
[utils.asGridCoord(36,20)] : true,
[utils.asGridCoord(35,20)] : true,
[utils.asGridCoord(34,20)] : true,
[utils.asGridCoord(33,20)] : true,
[utils.asGridCoord(32,20)] : true,
[utils.asGridCoord(31,20)] : true,
[utils.asGridCoord(30,20)] : true,
[utils.asGridCoord(29,20)] : true,
[utils.asGridCoord(29,19)] : true,
[utils.asGridCoord(28,19)] : true,
[utils.asGridCoord(28,18)] : true,
[utils.asGridCoord(28,17)] : true,
[utils.asGridCoord(27,17)] : true,
[utils.asGridCoord(27,16)] : true,
[utils.asGridCoord(26,16)] : true,
[utils.asGridCoord(26,15)] : true,

//DALOS


 

    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(28,6)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Kitchen",
              x: utils.withGrid(9),
              y: utils.withGrid(11), 
              direction: "down"
            }
          ]
        }
      ]
    }
    
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(9),
        y: utils.withGrid(11),
      }),
      npcB: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [ 
              { type: "textMessage", text: "We finally meet, Black Bunny! Let's end it once and for all", faceHero: "npcB" },
              { type: "battle", enemyId: "Bushi" },
              { type: "addStoryFlag", flag: "DEFEATED_Bushi"},
              { type: "textMessage", text: "You won the battle but the war isn't over.", faceHero: "npcB" },
              { type: "textMessage", text: "Go away!"},
            ]
          }
        ]
      })
    },
    walls:{
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(13,3)] : true,
      [utils.asGridCoord(14,3)] : true,
      [utils.asGridCoord(15,3)] : true,
      [utils.asGridCoord(16,3)] : true,
      [utils.asGridCoord(17,3)] : true,
      [utils.asGridCoord(18,3)] : true,
      [utils.asGridCoord(19,3)] : true,
      [utils.asGridCoord(20,3)] : true,
      [utils.asGridCoord(20,4)] : true,
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(20,6)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(20,8)] : true,
      [utils.asGridCoord(20,9)] : true,
      [utils.asGridCoord(20,10)] : true,
      [utils.asGridCoord(20,11)] : true,
      [utils.asGridCoord(19,11)] : true,
      [utils.asGridCoord(18,11)] : true,
      [utils.asGridCoord(17,11)] : true,
      [utils.asGridCoord(16,11)] : true,
      [utils.asGridCoord(15,11)] : true,
      [utils.asGridCoord(14,11)] : true,
      [utils.asGridCoord(13,11)] : true,
      [utils.asGridCoord(12,11)] : true,
      [utils.asGridCoord(11,11)] : true,
      [utils.asGridCoord(11,12)] : true,
      [utils.asGridCoord(11,13)] : true,
      [utils.asGridCoord(11,13)] : true,
      [utils.asGridCoord(10,13)] : true,
      [utils.asGridCoord(9,13)] : true,
      [utils.asGridCoord(8,13)] : true,
      [utils.asGridCoord(7,12)] : true,
      [utils.asGridCoord(7,11)] : true,
      [utils.asGridCoord(6,11)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,11)] : true,
      [utils.asGridCoord(3,11)] : true,
      [utils.asGridCoord(2,11)] : true,
      [utils.asGridCoord(1,11)] : true,
      [utils.asGridCoord(0,11)] : true,
      [utils.asGridCoord(-1,11)] : true,
      [utils.asGridCoord(-1,10)] : true,
      [utils.asGridCoord(-1,9)] : true,
      [utils.asGridCoord(-1,8)] : true,
      [utils.asGridCoord(-1,7)] : true,
      [utils.asGridCoord(-1,6)] : true,
      [utils.asGridCoord(-1,5)] : true,
      [utils.asGridCoord(-1,4)] : true,
      [utils.asGridCoord(-1,3)] : true,
      [utils.asGridCoord(-1,2)] : true,
      [utils.asGridCoord(-1,1)] : true,
     
     
     
     
    },
    cutsceneSpaces: {
      [utils.asGridCoord(9,12)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "DemoRoom",
              x: utils.withGrid(28),
              y: utils.withGrid(8), 
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      })
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29,9)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10), 
              direction: "up"
            }
          ]
        }
      ]
    }
  }
}