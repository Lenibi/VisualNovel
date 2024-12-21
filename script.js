/*Before starting this visual novel project, I need to break down the core components
the game needs three main classes: TextBoxOptions for handling player choices, 
textBox for managing dialogue and text animation effects, and Scene for coordinating 
backgrounds and character images
progress through scenes sequentially with branching paths based on player choices
The game will progress through scenes and have different outcomes based on player choices.
Each scene has visual elements and text that appears letter by letter in a typewriter effect.*/

// Handle the dialogue choices, includes the creation and interaction of buttons
class TextBoxOptions {
    //Every class needs a constructor
    constructor(optionLabels, actionCallbacks)
    {
        // Store the button text and actions
        this.optionLabels = optionLabels;
        this.actionCallbacks = actionCallbacks;
    }

    // Creates and displays the buttons on screen
    createOptions()
    {
        const optionsContainer = document.getElementById("text-box-options");
        // reset the inner html
        optionsContainer.innerHTML = "";

        // loop through all options and make a button and show it. Handle the onclick so that the buttons are clickable
        this.optionLabels.forEach((label, index) => {
            const button = document.createElement("button");
            button.innerText = label;

            button.onclick = async () => {
                // when an option button is clicked, reset the text box content by making it blank
                const contentElement = document.getElementById("text-box-content");
                contentElement.innerHTML = "";
                // adds a small delay between scenes so the transition isn't too fast
                await new Promise(resolve => setTimeout(resolve, 100));
                this.actionCallbacks[index]();
            };
            optionsContainer.appendChild(button); // add the generated button to the options container 
        });
    }
}

// Displays text and handles the dialogue and text animation
class TextBox {
    // Class constructor, set all variables to parameters or default values
    constructor(title, text, textBoxOptions) {
        this.title = title;
        this.text = text;
        this.textBoxOptions = textBoxOptions;
        this.isTyping = false;
        // Check if title screen by checking the title text
        this.isTitle = title === "Risen From The Ashes";
    }

    // This creates the typewriter animation effect for text
    // Fixed bug where no spaces, so adds a space after punctuation marks
    async typeWriterEffect(contentElement, text)
    {
        this.isTyping = true;
        contentElement.innerHTML = "";
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        contentElement.appendChild(cursor);

        // if not the end of the text string, loop through text add the line symbol in the text at that current index
        let currentText = "";
        for (let i = 0; i < text.length && this.isTyping; i++) {
            currentText += text[i];
            contentElement.innerHTML = currentText;
            contentElement.appendChild(cursor);
            
            // Add space after punctuation for better readability
            if ('.!?'.includes(text[i]) && i + 1 < text.length && text[i + 1] !== ' ') {
                currentText += ' ';
                i++;
            }
            // slight delay
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        // Done the typewriter effect, all text is visible
        this.isTyping = false;
        cursor.remove();
    }

    // Renders the text box and manages dialogue and choices
    async render(nextSceneCallback)
    {
        // get all the references to the elements
        const titleElement = document.getElementById("text-box-title");
        const contentElement = document.getElementById("text-box-content");
        const optionsContainer = document.getElementById("text-box-options");
        const textBox = document.getElementById("text-box");
        const scene = document.getElementById("scene");

        // The start title scene is different from the other scenes in terms of format. There is still text and a button similar to the other 
        // dialogue scenes, but the css is slightly different. There is also no background image for the title page.
        // So if title, add the title class to the css, else if it is a normal dialogue scene then it should haev no title classes so remove the title css
        if (this.isTitle)
        {
            textBox.classList.add('title');
            titleElement.classList.add('title');
            contentElement.classList.add('title');
            optionsContainer.classList.add('title');
        }
        else
        {
            textBox.classList.remove('title');
            titleElement.classList.remove('title');
            contentElement.classList.remove('title');
            optionsContainer.classList.remove('title');
        }

        // clear existing content
        optionsContainer.innerHTML = "";
        titleElement.textContent = this.title;
        contentElement.innerHTML = "";

        // when the scene mouse onclick, if the typewriter effect is still happening, stop the typing effect and just set the text
        // dirtectly to fast forward the typewriter effect as the user does not want to wait for the text to load.
        // This is a feature we decided to add later, as the typewriter text was very annoying to wait out
        // Also if the user is a fast reader, they may not want to wait for the text to be typed out because it is slow
        // Otherwise, if done typing then when click it should take you to the next scene 
        scene.onclick = () => {
            if (this.isTyping) {
                this.isTyping = false;
                contentElement.innerHTML = this.text;
                if (!this.textBoxOptions) {
                    scene.onclick = nextSceneCallback;
                }
            } else if (!this.textBoxOptions) {
                nextSceneCallback();
            }
        };

        // starts the typewriter animation effect
        await this.typeWriterEffect(contentElement, this.text);

        // If choice options exist, display them
        if (this.textBoxOptions) {
            this.textBoxOptions.createOptions();
            scene.onclick = null;
        }
    }
}

// Scenes
// Controls images for background and characters
class Scene {
    constructor(backgroundImage, characterImage, textBox)
    {
        this.backgroundImage = backgroundImage;
        this.characterImage = characterImage;
        this.textBox = textBox;
    }

    // Renders the entire scene (includes background, character, text, etc)
    render(nextSceneCallback) {
        const bgImg = document.getElementById("background-image");
        const charImg = document.getElementById("character-image");
        
        // Display error message if there are any missing images
        bgImg.onerror = function() {
            console.error(`Failed to load background image: ${this.src}`);
            this.style.display = 'none';
        };
        charImg.onerror = function() {
            console.error(`Failed to load character image: ${this.src}`);
            this.style.display = 'none';
        };

        // make sure that images can be seen when they're loaded in
        bgImg.onload = function() {
            this.style.display = 'block';
            this.style.opacity = '1';
        };
        charImg.onload = function() {
            this.style.display = 'block';
            this.style.opacity = '1';
        };

        // Default
        bgImg.style.display = 'block';
        charImg.style.display = 'block';

        // Load images if they're available
        if (this.backgroundImage) {
            bgImg.src = this.backgroundImage;
        } else {
            bgImg.style.display = 'none';
        }
        
        if (this.characterImage) {
            charImg.src = this.characterImage;
        } else {
            charImg.style.display = 'none';
        }

        this.textBox.render(nextSceneCallback);
    }
}

// Tracks the current position in the story
let currentSceneIndex = 0;

// Handles transitions between scenes
function transitionToScene(index) {
    currentSceneIndex = index;
    if (currentSceneIndex < scenes.length) {
        scenes[currentSceneIndex].render(() => transitionToScene(currentSceneIndex + 1));
    }
}

// The good thing about this program is that it is designed to be reusable. Since every scene is similar and there is a scene class,
// an array of scenes is used to make all the scenes with Scene consutrctors for each setting up all the differnet dialogue text easily
// This also makes it easier to find and edit the dialogue or scenes
// Organization is also good this way because all the diualogue text and scenes images are together
const scenes = [
    new Scene(
        // Title scene
        "",
        "",
        new TextBox(
            "Risen From The Ashes",
            "Controls: Mouse click to go to the next panel or click option buttons.",
            new TextBoxOptions(
                ["Play"],
                // Starts the game from the first scene, when you meet Ash
                [() => transitionToScene(1)]
            )
        )
    ),

    new Scene(
        // Scene where you meet Ash
        "./images/house.png",
        "./images/ashCharacter.png",
        new TextBox("Ash", "Hm, this is the address. This house is in such a secluded area. It's a strange place to host a house party... Oh well!", null)
    ),

    new Scene(
        // Shows new background with Ash still in the foreground
        // Indicates that he's thinking
        "./images/houseInterior.png",
        "./images/ashCharacter.png",
        new TextBox("Ash", "*Thinking*: This will be a good opportunity to make some friends.", null)
    ),

    new Scene(
        "./images/houseInterior.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "Hi! I'm Aurora! Welcome to the party!! Would you like me to show you around?",
            new TextBoxOptions(
                // Shows two choices for the player, and switches to a different scene depending on what the player chooses
                ["Yes", "No"],
                [() => transitionToScene(4), () => transitionToScene(5)]
            )
        )
    ),

    new Scene(
        // New background and character, Aurora
        "./images/livingRoom.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "This is the living room! This is where everyone is hanging out. Feel free to mingle!", null)
    ),
    new Scene(
        "./images/livingRoom.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "No prob! Let me know if there's anything you need!", null)
    ),

    // Everest Scenes
    new Scene(
        "./images/livingRoom.png",
        "./images/everestCharacter.png",
        new TextBox("Everest", "You must be new in town. Nice to meet you! My name is Everest!",
            new TextBoxOptions(
                // More choices and different scenes corresponding to the player's choice
                ["Nice to meet you too", "Who asked"],
                [() => transitionToScene(currentSceneIndex + 1), () => transitionToScene(currentSceneIndex + 2)]
            )
        )
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/everestCharacter.png",
        // Everest friendly answer
        new TextBox("Everest", "Yay! We're friends now!", null)
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/everestCharacter.png",
        // Everest sad answer
        new TextBox("Everest", "Oh... I'm sorry...", null)
    ),

    // Skye Scenes
    new Scene(
        "./images/livingRoom.png",
        "./images/skyeCharacter.png",
        new TextBox("Skye", "This party is kind of a bust, huh?",
            new TextBoxOptions(
                ["Agree", "Disagree"],
                [() => transitionToScene(currentSceneIndex + 1), () => transitionToScene(currentSceneIndex + 2)]
            )
        )
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/skyeCharacter.png",
        // Skye friendly answer
        new TextBox("Skye", "You seem cool. I like you already!", null)
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/skyeCharacter.png",
        // Skye disapproving answer
        new TextBox("Skye", "Are you serious?", null)
    ),

    // Blaze Scene
    new Scene(
        "./images/livingRoom.png",
        "./images/blazeCharacter.png",
        new TextBox("Blaze", "Thanks for attending. This party is gonna be a blast!", null)
    ),

    // Aurora Final Scenes
    new Scene(
        "./images/livingRoom.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "Hey again! Having fun?",
            new TextBoxOptions(
                ["Yes", "No"],
                [() => transitionToScene(currentSceneIndex + 1), () => transitionToScene(currentSceneIndex + 2)]
            )
        )
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "Awesome! Feel free to wander around.", null)
    ),

    new Scene(
        "./images/livingRoom.png",
        "./images/auroraCharacter.png",
        new TextBox("Aurora", "Oh no!", null)
    ),

    // Dining Room Scenes
    new Scene(
        "./images/diningRoom.png",
        "",
        new TextBox("", "You enter the dining room and see a table filled with delicious food. What would you like to do?",
            new TextBoxOptions(
                ["Eat some food", "Inspect the table", "Leave"],
                [() => transitionToScene(currentSceneIndex + 1), () => transitionToScene(currentSceneIndex + 2), () => transitionToScene(currentSceneIndex + 3)]
            )
        )
    ),

    new Scene(
        "./images/diningRoom.png",
        "",
        new TextBox("", "You enjoy some delicious snacks!", null)
    ),

    new Scene(
        "./images/diningRoom.png",
        "",
        new TextBox("", "You notice a variety of dishes neatly arranged.", null)
    ),

    new Scene(
        "./images/diningRoom.png",
        "",
        new TextBox("", "You decide to leave the dining room.", null)
    ),

    // End Scene
    new Scene(
        "./images/black.png",
        "",
        new TextBox(
            "",
            "The End",
            new TextBoxOptions(
                ["Back to Start"],
                [() => transitionToScene(0)]  // Takes you back to the first scene
            )
        )
    )
];

// This is where the actual program starts (like a main function in c++)
// When the document loads, the first scene will be shown.
document.addEventListener('DOMContentLoaded', () => {
    transitionToScene(0);
});