var Cobete = Soda.Solid.extend
({
    width: 20,
    height: 43,
    angle: 0,

    force: new b2Vec2(0, 5000),

    init: function(world)
    {

        /*var shape = new b2BoxDef();
        shape.density = 1.0;
        shape.extents.Set(20/2, 43/2); // Extents el vector que define del vertice al centro!!
         */

        // Tiene que ser counter-clockwise
        var shape = new b2PolyDef();
        shape.density = 1.0;
        shape.restitution = .4;
        shape.vertexCount = 5;
        shape.vertices[0].Set(10.0, 0.0);
        shape.vertices[1].Set(20.0, 18.0);
        shape.vertices[2].Set(20.0, 43.0);
        shape.vertices[3].Set(0.0, 43.0);
        shape.vertices[4].Set(0.0, 18.0);
/*
        var shape = new b2PolyDef();
        shape.density = 1.0;
        shape.restitution = .4;
        shape.vertexCount = 4;
        shape.vertices[0].Set(20.0, 18.0);
        shape.vertices[1].Set(20.0, 43.0);
        shape.vertices[2].Set(0.0, 43.0);
        shape.vertices[3].Set(0.0, 18.0);
*/
        /*shape.vertices =
        [
            {x: 10, y: 0},
            {x: 20, y: 18},
            {x: 20, y: 43},
            {x: 0, y: 43},
            {x: 0, y: 18}
        ];*/

        this.bodyDef = new b2BodyDef();
        this.bodyDef.AddShape(shape);
        this.bodyDef.position.Set(200, 0);

        this.cobete = new Image();
        this.cobete.src = 'cobete.png';

        this.bg = new Image();
        this.bg.src = 'screen.jpg';
    },

    update: function(world)
    {
        if (world.key.press.up)
            this.ignite();

        if (world.key.press.right)
            this.turn(1);

        if (world.key.press.left)
            this.turn(-1);
    },

    draw: function(world)
    {
        // this.drawShape(world);

        // Pintamos fondo---evidentemente no se hara aqui

        world.context.drawImage(this.bg, 0, 0, world.width, world.height);

        var pos = this.body.m_position;
        /*var angle = this.body.GetRotation();
        var degrees = angle*180/Math.PI;*/

        var m = this.body.GetRotationMatrix();

        world.context.save();

            world.context.setTransform
            (
                m.col1.x, m.col1.y,
                m.col2.x, m.col2.y,
                pos.x, pos.y
            );
            //world.context.rotate(angle);
            /**
             * La posicion devuelta por el box2D es el centro de la imagen
             * tenemos que tenerlo en cuenta ya que drawImage neceista el vertice
             * superior izquierdo
             */




            world.context.drawImage(this.cobete, -this.width/2, -this.height/2);
        world.context.restore();


        // Pintamos vector velocidad linear
        world.context.save();

            world.context.setTransform
            (
                1, 0,
                0, 1,
                50, 50
            );

            var v = this.body.GetLinearVelocity();
            var pos = this.body.GetLocalPoint(this.body.m_position);
            var context = world.context;
            context.beginPath();
            context.moveTo(pos.x, pos.y);
            context.lineTo(v.x, v.y);
            context.fillRect(v.x, v.y, 7, 7);
            context.stroke();
            context.fill();
        world.context.restore();
    },

    ignite: function()
    {
        //var force_globalcoords = b2Math.b2MulMV(this.body.GetRotationMatrix(), this.force);

        this.body.WakeUp(true);

        // Fuerza desde el centro del cuerpo y en direccion le vector fuerza
        //this.body.ApplyImpulse(this.body.m_position, force_globalcoords);
        //this.body.ApplyImpulse(new b2Vec2(0.0, -10.0*this.body.GetMass()), this.body.GetWorldPoint(this.body.GetCenterPosition()));
        //this.body.SetLinearVelocity(this.body.GetWorldVector(new b2Vec2(0.0, -.1*this.body.GetMass())));
        //this.body.SetLinearVelocity(new b2Vec2(0.0, -.1*this.body.GetMass()));
        /*this.body.ApplyImpulse(
            this.body.GetWorldVector(new b2Vec2(0, -10.0*this.body.GetMass())),
            this.body.GetWorldPoint(new b2Vec2(10.0, 20.0))
        );*/

        with(this.body)
        {
            var potencia = .0015;

            var v = GetLinearVelocity();
            var impulse = GetWorldVector(new b2Vec2(0.0, -potencia*GetMass()));

            var sum = new b2Vec2(v.x + impulse.x, v.y + impulse.y);

            SetLinearVelocity(sum);
        }
        //   var mass_center = this.body.GetCenterPosition();
        //   this.body.SetLinearVelocity(new b2Vec2(50,0));
           //console.log(mass_center.x, mass_center.y);
        //var mass_center = this.body.GetCenterPosition();

        //this.body.ApplyForce(this.body.GetWorldPoint()this.body.m_position, new b2Vec2(0, -500000));

        // Dibujar vector fuerza
        // Convertimos el vector de coordenadas locales del cobete a
        // coordenadas globales
        /*var pos = this.body.m_position;
        var m = this.body.GetRotationMatrix();

        var vector = b2Math.b2MulMV(m, this.force);
        var origen = b2Math.b2MulMV(m, pos);

        world.context.moveTo(pos.x, pos.y);
        world.context.lineTo(vector.x + pos.x, vector.y + pos.y);
        world.context.lineTo(vector.x + pos.x, vector.y + pos.y);
        world.context.strokeStyle = "#e00";
        world.context.stroke();*/
    },

    turn: function (direction)
    {
        var potencia = 0.05;
        var limit = 1;

        var v = this.body.GetAngularVelocity();

        // Se limita la velocidad de giro
        var impulse = v + direction*0.05;
        if(impulse > limit) impulse = direction*limit;

        this.body.WakeUp(true);
        this.body.SetAngularVelocity(impulse);
    },

    cobete: undefined
});

var Ground = Soda.Solid.extend
({
    x: 0,
    y: window.innerHeight,
    width: window.innerWidth,
    init: function(world)
    {
        var shape = new b2BoxDef();
        shape.extents.Set(this.width, 50);
        shape.restitution = 0.2;

        this.bodyDef = new b2BodyDef();
        this.bodyDef.AddShape(shape);
        this.bodyDef.position.Set(this.x, this.y);

        this.shadow = new Image();
        this.shadow.src = 'shadow.png';
    },

    update: function(world)
    {
        this.y = world.height;
        this.width = world.width;
    },

    draw: function(world)
    {
        var pos = world.cobete.body.m_position;

        // Dibujamos sombra que siga al cobete
        world.context.globalAlpha = (pos.y/(this.y+800)); // Cambia la opacidad segun altura
        world.context.drawImage(this.shadow, pos.x-11, this.y-52);
        world.context.globalAlpha = 1;
        //   this.drawShape(world);
    },

    resize: function(world) {

    }
});

var Game = Soda.World.extend
({
    key:
    {
        press:
        {
            up: false,
            down: false,
            right: false,
            left: false
        }
    },

    cobete: new Cobete(),
    ground: new Ground()
});

var game = new Game({
    canvas: document.getElementById('world')
});

game.add(game.cobete);
game.add(game.ground);

window.addEventListener ('keydown', function (evt)
{
    switch (evt.keyCode)
    {
        case 38:  game.key.press.up = true; break;
        case 40:  game.key.press.down = true; break;
        case 37:  game.key.press.left = true; break;
        case 39:  game.key.press.right = true; break;
    }
}, true);

window.addEventListener ('keyup', function (evt)
{
    switch (evt.keyCode)
    {
        case 38:  game.key.press.up = false; break;
        case 40:  game.key.press.down = false; break;
        case 37:  game.key.press.left = false; break;
        case 39:  game.key.press.right = false; break;
    }
}, true);

game.launch();
