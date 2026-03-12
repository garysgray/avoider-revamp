const gameTexts= 
{
    INIT: 
    {
        INSTRUCTIONS: 
        [
            "Mouse to Move!",
            "Mouse-Btn to Fire!!",
            "Catch the Power-Ups!",
            "Deal with the Drones!!!",
            "Press Space-Bar to Start!!",
        ]
    },

    HUD: 
    {
        SCORE: "Score: ",
        AMMO:  "Ammo: ",
        LIVES: "Lives: "
    },

    WIN:  { MESSAGE:     "PRESS  ENTER  TO  PLAY  AGAIN"   },
    
    LOSE: { DIE_MESSAGE: "GAME OVER,  SPACE-BAR  TO  RETRY" }
}

Object.freeze(gameTexts);