/*** @type {Entity[]} */
let entities = [];

function runLearning(
    {
        canvas,
        beginRule = () => true,
        rule = () => true,
        endRule = () => true,
        ruleRender = () => true,
        skipToGeneration = 20,
        maxIteration = 100,
        entityAmount = 100,
        startX = 100,
        startY = 100,
        speed = 1
    }
) {
    const ctx = canvas.getContext("2d");
    const random = (a, b) => Math.floor(Math.random() * (Math.max(a, b) - Math.min(a, b))) + Math.min(a, b);
    entities = [];
    let movement = 0;
    let isFirstTrain = true;
    let lastGeneration = null;

    function spawnEntities() {
        generation++;
        movement = 0;
        entities.forEach(i => !endRule(i) ? i.alive = false : false);
        if (isFirstTrain) {
            entities = new Array(entityAmount).fill("").map(() => new Entity(startX, startY, 5, new Array(maxIteration).fill("").map(() => [random(-speed * 1000, speed * 1000) / 1000, random(-speed * 1000, speed * 1000) / 1000])))
        } else {
            const survived = entities.filter(i => i.alive);
            lastGeneration = (survived.length / entities.length * 100).toFixed(3);
            if (survived.length === 0) throw new Error("No one have survived :/");
            const males = survived.filter(i => i.gender === 0);
            const females = survived.filter(i => i.gender === 1);
            const calcMovement = (x, y, z, t) => ((males[x].movements[z][t] + females[y].movements[z][t]) + (random(-speed * 1000, speed * 1000) / 1000)) / 3;
            if (males.length === 0) throw new Error("No males has survived :/");
            if (females.length === 0) throw new Error("No females has survived :/");
            entities = new Array(entityAmount).fill("").map(() => {
                const dadI = Math.floor(Math.random() * males.length);
                const momI = Math.floor(Math.random() * females.length);
                return new Entity(startX, startY, 5, new Array(maxIteration).fill("").map((_, a) => [calcMovement(dadI, momI, a, 0), calcMovement(dadI, momI, a, 1)]))
            });
        }
        isFirstTrain = false;
        entities.forEach(i => !beginRule(i) ? i.alive = false : false);
    }

    let generation = 0;

    function render(a = true) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        entities.filter(i => i.alive).forEach(i => {
            !rule(i) ? i.alive = false : false
            const move = i.movements[movement];
            i.x += move[0];
            i.y += move[1];
            if (generation >= skipToGeneration) {
                ctx.beginPath();
                ctx.fillStyle = ["#4677fa", "#da1ac9"][i.gender];
                ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }
        });
        movement++;
        if (generation >= skipToGeneration) document.getElementById("stats").innerHTML = `Dead: ${entities.filter(i => !i.alive).length}<br>Alive: ${entities.filter(i => i.alive).length}<br>Remaining ticks: ${maxIteration - movement}${lastGeneration ? "<br>Last generation aliveness: " + lastGeneration + "%" : ""}<br>Generation: ${generation}`;
        if (movement === maxIteration) spawnEntities();
        if (generation >= skipToGeneration) ruleRender();
        if (a) requestAnimationFrame(render);
    }

    class Entity {
        constructor(x, y, r, movements, gender = random(0, 2)) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.gender = gender;
            this.alive = true;
            this.movements = movements;
        }

        distance(x, y) {
            return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
        }
    }

    spawnEntities();

    while (generation < skipToGeneration) {
        render(false);
    }

    render()
}