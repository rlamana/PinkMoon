/**
 * This file is part of Soda Package.
 *
 * @copyright (c) 2010 Ramón Lamana <rlamana@gmail.com>
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 *
 */

/**
 * @namespace Soda's Engine classes and functions
 */
var Soda =
{
    px2m: function(px)
    {
        return px/30;
    }
};

/**
 * Wrap of Box2D Engine
 *
 * @lends Soda.Physics
 */
Soda.Physics = Class.extend
({
    engine: undefined,

    /**
     * Set up the physical environement
     *
     * @public
     * @constructs
     */
    init: function()
    {
        // box2d setup
        var aabb = new b2AABB();
        aabb.minVertex.Set(-1000, -1000);
        aabb.maxVertex.Set(1000, 1000);
        var gravity = new b2Vec2(0, 40); //new b2Vec2(0, 200),
        doSleep = true;

        this._iteration = 1;
        this._step = 1.0 / 60;
        this.engine = new b2World(aabb, gravity, doSleep);
    },

    /**
     * Steps world simulation
     *
     * @public
     */
    step: function()
    {
        this.engine.Step(this._step, this._iteration);
    },

    /**
     * @private
     */
    _step: undefined,

    /**
     * @private
     */
    _iteration: 1
});


/**
 * Entidad básica del motor
 *
 * @lends Soda.Entity
 */
Soda.Entity = Class.extend
({
    /**
     * Initializes the entity
     *
     * @param {World} world The World object where the entity is included
     * @public
     * @constructs
     */
    init: function(world){},

    /**
     * Method called when 'update' event is triggered by the engine.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    update: function(world){},

    /**
     * Method called when 'draw' event is triggered by the engine.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    draw: function(world){},

    /**
     * Method called when 'resize' event is triggered by the engine.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    resize: function(world){}
});

/**
 * Solid Class
 *
 * @lends Soda.Solid
 * @memberOf Soda
 */
Soda.Solid = Soda.Entity.extend
({
    /**
     * Creates the Box2D based entity.
     * Overrides {@link Soda.Entity.init}.
     *
     * @extends Soda.Entity
     * @constructs
     * @public
     */
    init: function(){},

    /**
     * Inherited from {@link Soda.Entity.update}.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    update: function(world){},

    /**
     * Inherited from {@link Soda.Entity.draw}.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    draw: function(world){},

    /**
     * Inherited from {@link Soda.Entity.resize}.
     *
     * @param {World} world The World object where the entity is included
     * @public
     */
    resize: function(world){},

    /**
     * Draws Box2D Body shape for debugging purposes.
     *
     * @public
     */
    drawShape: function(world)
    {
        var context = world.context;

        if (typeof this.body === 'undefined' || !this.body.GetShapeList) {
            console.warn('Solid\'s body not ready');
            return;
        }

        for (var shape = this.body.GetShapeList();
                 shape != null;
                 shape = shape.GetNext())
        {
            var pos = this.body.m_position;
            var m = this.body.GetRotationMatrix();

            world.context.save();

                world.context.setTransform
                (
                    m.col1.x, m.col1.y,
                    m.col2.x, m.col2.y,
                    pos.x, pos.y
                );

                context.beginPath();
                context.moveTo(shape.m_vertices[0].x, shape.m_vertices[0].y);
                for (var i = 0; i < shape.m_vertexCount; i++)
                {
                    context.lineTo(shape.m_vertices[i].x, shape.m_vertices[i].y);
                }
                context.lineTo(shape.m_vertices[0].x, shape.m_vertices[0].y);
                context.stroke();
                context.fill();
            world.context.restore();



            /*context.beginPath();
            var tV = b2Math.AddVV(shape.m_position, b2Math.b2MulMV(
                                                    shape.m_R,
                                                    shape.m_vertices[0]));

            context.moveTo(tV.x, tV.y);

            for (var i = 0; i < shape.m_vertexCount; i++)
            {
                var v = b2Math.AddVV(shape.m_position, b2Math.b2MulMV(
                                                       shape.m_R,
                                                       shape.m_vertices[i]));

                context.lineTo(v.x, v.y);
            }
            context.lineTo(tV.x, tV.y);
        }
        context.stroke();
        context.fill();*/
        }
    },

    /**
     * Get a human-readable representation of this {@link Soda.Solid}
     *
     * @public
     * @return {string} String representation of the solid entity.
     */
    toString: function()
    {
        return "Solid";
    },

    /**
     * Body object from Box2D engine.
     *
     * @property {b2BodyDef} body Body object from Box2D engine.
     * @default undefined
     * @public
     */
    body: undefined

});

/**
 * World Class
 *
 * @lends Soda.World
 */
Soda.World = Class.extend
({
    /**
     * @property {int} width World width.
     * @public
     */
    width:      100,

    /**
     * @property {int} height World height.
     * @public
     */
    height:     100,

    /**
     * World's physics engine.
     * @type {int}
     * @public
     */
    physics:    undefined,

    /**
     * @property {HTMLCavasElement} canvas Reference to canvas element where the world
     *           is rendered.
     * @public
     */
    canvas:     undefined,

    /**
     * @property {CanvasRenderingContext2D} context Canvas' context to draw.
     * @public
     */
    context:    undefined,

    /**
     * Inits World.
     *
     * @param {Object} options World's render and configuration options.
     * @constructs
     * @public
     */
    init: function(options)
    {
        var resize;

        // Games Parameters
        this.fps = 60;
        this.width = 960;
        this.height = 640;

        // Canvas Configuration
        this.canvas = options.canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Context Configuration
        this.context = this.canvas.getContext("2d");
        this.context.strokeStyle = "#000000";
        this.context.fillStyle = "#cccccc";

        // Physics Engine Box2D
        this.physics = new Soda.Physics();

        resize = function() {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
            this._resized = true;
            this.render();
        }.bind(this);
        resize();

        // Resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resize, false);
    },

    /**
     * Updates the world:<br/>
     *   - Adds, deletes queued entities.<br/>
     *   - Launches update and draw events to all visible entities.<br/>
     *   - Step the physics engine.
     *
     *  @public
     */
    render: function()
    {
        // Add any new entities
        for (var i=0; i<this._added_entities.length; i++)
        {
            var entity = this._added_entities[i];
            this._entities.push(entity);

            if (entity.update)
                entity.update(this);

            // Si es un cuerpo fisico, lo añadimos al motor fisicas
            if ((entity instanceof Soda.Solid) && (typeof entity.bodyDef !== 'undefined')) {
                // CreateBody no referencia, copia. Por eso se sobreescribe entity.body
                entity.body = this.physics.engine.CreateBody(entity.bodyDef); // <--- Creamos el objeto en el motor Box2D
            }
        }
        this._added_entities = [];

        // Actualizamos el motor de fisica
        this.physics.step();

        // Se limpia el canvas
        this.context.clearRect(0, 0, this.width, this.height);

        for (var i=0; i<this._entities.length; i++)
        {
            var entity = this._entities[i];

            if (entity.update)
                entity.update(this);

            if (entity.draw)
                entity.draw(this);

            if (entity.resize)
                entity.resize(this);
        }

        this._resized = false; // Reset resized state
    },

    /**
     * Adds a new renderable entity to the world.
     *
     * @param {Entity} entity Entity object to add into this world.
     * @public
     */
    add: function(entity)
    {
        this._added_entities.push(entity);
    },

    /**
     * Launches game.
     *
     * @public
     */
    launch: function()
    {
        var that = this;
        setInterval(function mainloop()
        {
            that.render();
        },
        10);
    },

    /**
     * List of world's entities.
     * @private
     */
    _entities: [],

    /**
     * Queue of new entities to add.
     * @private
     */
    _added_entities: [],

    /**
     * Queue of entities to delete.
     * @private
     */
    _deleted_entities: [],

    /**
     * Whether or not a resize event has been triggered.
     * @private
     */
    _resized: true

});

/**
 * Soda Singleton
 *
 * Contiene el MainLoop, que controla los
 * mundos creados.
 */
/*
var Soda = window.Soda =
{
    createWorld()
    render: function()
    {

    },

    _worlds: [];
};
*/
