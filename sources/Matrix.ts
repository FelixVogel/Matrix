/**
 Copyright (c) 2020 Felix Vogel
 https://github.com/FelixVogel/Matrix

 For the full copyright and license information, please view the LICENSE
 file that was distributed with this source code.
 */
module Matrix {

    export const DEFAULT_SIZE = 300;
    export const DEFAULT_COLOR = '#44ff00';
    export const DEFAULT_SYMBOLS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ日(+*;)-|2589Z';
    export const DEFAULT_SPEED = 1;
    export const DEFAULT_LINE_LENGTH = 16;
    export const DEFAULT_ROTATION = 0;
    export const DEFAULT_UPDATE_RATE = 32;
    export const DEFAULT_FX = new MatrixFX.BasicColumnFX();
    export const DEFAULT_MOVE_CHANCE = 0.51;
    export const DEFAULT_MUTATION_CHANCE = 0.1;

    export const COLUMN_SIZE = 12;
    export const MAX_SPEED = 32;
    export const MAX_LINE_LENGTH = 32;

    // --- Internal Settings

    let created = false;

    let width: number = DEFAULT_SIZE;
    let height: number = DEFAULT_SIZE;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    let color: string = DEFAULT_COLOR;

    let characters: string;
    let characterSizes: number[];

    function convertSymbols(_symbols: string = DEFAULT_SYMBOLS): void {
        characters = _symbols;
        characterSizes = [];

        for (let i = 0, l = characters.length; i < l; i ++) {
            characterSizes[i] = ctx.measureText(characters[i]).width / 2.0;
        }
    }

    function random_char(): number {
        return Math.floor(Math.random() * characters.length);
    }

    let speed: number = DEFAULT_SPEED;
    let lineLength: number = DEFAULT_LINE_LENGTH;
    let rotation: number = DEFAULT_ROTATION;
    let ups: number = DEFAULT_UPDATE_RATE;
    let useFX: boolean = false;
    let fx: MatrixFX.FX = DEFAULT_FX;
    let moveChance: number = DEFAULT_MOVE_CHANCE;
    let mutationChance: number = DEFAULT_MUTATION_CHANCE;

    // --- Creation

    export interface OptionalSettings {
        size?: {width: number, height: number},
        color?: string,
        symbols?: string,
        speed?: number,
        lineLength?: number,
        rotation?: number,
        updateRate?: number,
        useFX?: boolean,
        fx?: MatrixFX.FX,
        moveChance?: number,
        mutationChance?: number
    }

    export function create(selector: string, settings?: OptionalSettings): void {
        let _canvas: HTMLCanvasElement = document.querySelector(selector);

        if (_canvas.tagName.toLowerCase() != 'canvas') return;

        created = true;

        canvas = _canvas;
        ctx = _canvas.getContext('2d');

        resize(DEFAULT_SIZE, DEFAULT_SIZE);

        // Settings
        convertSymbols(DEFAULT_SYMBOLS);

        if (settings) {
            if (settings.size) resize(settings.size.width, settings.size.height);
            if (settings.color) Settings.setColor(settings.color);
            if (settings.symbols) Settings.setSymbols(settings.symbols);
            if (settings.speed) Settings.setSpeed(settings.speed);
            if (settings.lineLength) Settings.setLineLength(settings.lineLength);
            if (settings.rotation) Settings.setRotation(settings.rotation);
            if (settings.updateRate) Settings.setUpdateRate(settings.updateRate);
            if (settings.useFX != null) Settings.setUseFX(settings.useFX);
            if (settings.fx && settings.fx.render) Settings.setFX(settings.fx);
            if (settings.moveChance) Settings.setMoveChance(settings.moveChance);
            if (settings.mutationChance) Settings.setMutationChance(settings.mutationChance);
        }
    }

    export function start() {
        RenderEngine.start();
    }

    // --- Settings

    export function resize(_width: number = DEFAULT_SIZE, _height: number = DEFAULT_SIZE): void {
        if (!created) return;

        width = _width;
        height = _height;

        canvas.width = _width;
        canvas.height = _height;

        fx.fx_buffer(_width, _height);

        RenderEngine.recalculate_columns();
    }

    export module Settings {

        export function setColor(_color: string = DEFAULT_COLOR): void {
            color = _color;
        }

        export function getColor(): string {
            return color;
        }

        export function setSymbols(_symbols: string = DEFAULT_SYMBOLS): void {
            convertSymbols(_symbols);

            RenderEngine.recalculate_columns();
        }

        export function getSymbols(): string {
            return characters;
        }

        export function setSpeed(_speed: number = DEFAULT_SPEED): void {
            if (_speed < 1 || _speed > MAX_SPEED) _speed = DEFAULT_SPEED;

            speed = _speed;
        }

        export function getSpeed(): number {
            return speed;
        }

        export function setLineLength(_lineLength: number = DEFAULT_LINE_LENGTH): void {
            if (_lineLength < 1 || _lineLength > MAX_LINE_LENGTH) _lineLength = DEFAULT_LINE_LENGTH;

            lineLength = _lineLength;
        }

        export function getLineLength(): number {
            return lineLength;
        }

        export function setRotation(_rotation: number = DEFAULT_ROTATION): void {
            rotation = Utility.fixDegrees(_rotation);
        }

        export function getRotation(): number {
            return rotation;
        }

        export function setUpdateRate(_ups: number = DEFAULT_UPDATE_RATE): void {
            if (_ups < 1) _ups = DEFAULT_UPDATE_RATE;

            ups = _ups;
        }

        export function getUpdateRate(): number {
            return ups;
        }

        export function setUseFX(_useFX: boolean = false): void {
            useFX = _useFX;
        }

        export function getUseFX(): boolean {
            return useFX;
        }

        export function setFX(_fx: MatrixFX.FX = DEFAULT_FX): void {
            fx = _fx;

            fx.fx_buffer(width, height);
            fx.fx_render(0, width, height);
        }

        export function getFX(): MatrixFX.FX {
            return fx;
        }

        export function setMoveChance(_chance: number = DEFAULT_MOVE_CHANCE) {
            moveChance = _chance;
        }

        export function getMoveChance(): number {
            return moveChance;
        }

        export function setMutationChance(_chance: number = DEFAULT_MUTATION_CHANCE) {
            mutationChance = _chance;
        }

        export function getMutationChance(): number {
            return mutationChance;
        }

    }

    // Rendering

    module RenderEngine {

        interface Column {
            x: number,
            segments: ColumnSegment[]
        }

        interface ColumnSegment {
            delay: number,
            y: number,
            letters: number[],
            length: number,
        }

        let columns: Column[] = [];

        export function recalculate_columns(): void {
            columns = [];

            paint_reset();

            for (let x = 0; x < width; x += COLUMN_SIZE) {
                columns.push({
                    x: x,
                    segments: [create_segment()]
                });
            }
        }

        function create_segment(): ColumnSegment {
            let hLineLength = lineLength / 2.0;

            return {
                delay: Math.ceil(5 + Math.random() * 15),
                y: 0,
                letters: [],
                length: Math.ceil(hLineLength + Math.random() * hLineLength)
            };
        }

        let columnsAccumulator = 0;
        let colorAccumulator = 0;

        let bg: BG;

        function render_columns(/* delta: number */) {
            if (columnsAccumulator >= 1000.0 / speed) {
                ctx.beginPath();
                ctx.clearRect(0, 0, width, height);

                render_bg();

                for (let l_Column of columns) {
                    // ctx.beginPath();
                    // ctx.clearRect(l_Column.x, 0, COLUMN_SIZE, height);
                    //
                    // ctx.beginPath();
                    // ctx.drawImage(bg.getBuffer(), 0, 0, COLUMN_SIZE, height, l_Column.x, 0, COLUMN_SIZE, height);

                    // randomly determine regarding speed whether a column should be moved.
                    let move: boolean = Math.random() < moveChance;

                    let needsNext = true;
                    for (let l_Segment of l_Column.segments) {
                        if (l_Segment.delay > 0) {
                            needsNext = false;

                            if (!move) continue;

                            l_Segment.delay -= 1;

                            continue;
                        }

                        // ensure max one letter gets changed
                        let changedLetter: boolean = true;

                        if (move) {
                            changedLetter = false;

                            if (l_Segment.letters.length < l_Segment.length) {
                                l_Segment.letters.push(random_char());

                                needsNext = false;
                            } else {
                                ctx.beginPath();
                                ctx.clearRect(l_Column.x, l_Segment.y, COLUMN_SIZE, COLUMN_SIZE);

                                l_Segment.y += COLUMN_SIZE;
                            }
                        }

                        for (let i = 0, l = l_Segment.letters.length; i < l; i ++) {
                            let letter = l_Segment.letters[i];
                            // chance that letter gets changed
                            if (!changedLetter && Math.random() < mutationChance) {
                                changedLetter = true;

                                letter = random_char();
                                l_Segment.letters[i] = letter;

                                paint_letter_mutation(l_Column.x, l_Segment.y + COLUMN_SIZE * i);

                                continue;
                            }

                            paint_letter(letter, l_Column.x, l_Segment.y + COLUMN_SIZE * i);
                        }
                    }

                    if (move && needsNext) {
                        l_Column.segments.push(create_segment());
                    }

                    l_Column.segments = l_Column.segments.filter(segment => segment.y - (COLUMN_SIZE * segment.length) < height);
                }

                columnsAccumulator = 0;
            }
        }

        function render_bg() {
            ctx.save();

            // ctx.globalCompositeOperation = 'copy';
            ctx.globalAlpha = 0.3;

            ctx.drawImage(bg.getBuffer(), 0, 0);

            ctx.restore();
        }

        function render_color(delta: number) {
            ctx.save();

            ctx.globalCompositeOperation = 'source-atop';

            if (useFX) {
                if (colorAccumulator >= 1000.0 / ups) {
                    fx.fx_render(delta, width, height);

                    colorAccumulator = 0;
                }

                fx.fx_draw(ctx, width, height);
            } else {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.fillRect(0, 0, width, height);
            }

            ctx.restore();
        }

        export function start() {
            function loop(timestamp) {
                let delta = timestamp - lastRender;

                // ctx.clearRect(0, 0, width, height);

                // render_bg();

                columnsAccumulator += delta;

                render_columns(/* delta */);

                colorAccumulator += delta;

                render_color(delta);

                lastRender = timestamp;
                window.requestAnimationFrame(loop);
            }

            bg = new BG();

            paint_reset();

            let lastRender = 0;
            window.requestAnimationFrame(loop);
        }

        function paint_reset(): void {
            ctx.clearRect(0, 0, width, height);

            ctx.scale(1.2, 1.2);

            if (bg) bg.render();
        }

        function paint_letter(char: number, x: number, y: number): void {
            ctx.beginPath();
            ctx.clearRect(x, y, COLUMN_SIZE, COLUMN_SIZE);

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.fillText(characters[char], x + 6 - characterSizes[char], y + 2, COLUMN_SIZE);
        }

        function paint_letter_mutation(x: number, y: number) {
            ctx.beginPath();
            ctx.clearRect(x, y, COLUMN_SIZE, COLUMN_SIZE);

            ctx.save();

            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.fillRect(x + 3, y + 1, COLUMN_SIZE - 6, COLUMN_SIZE - 2);

            ctx.restore();
        }

        class BG extends Utility.GraphicCanvas {

            constructor() {
                super();
            }

            public render() {
                this.resize(width, height);

                this.ctx.clearRect(0, 0, width, height);

                this.ctx.fillStyle = '#000000';

                for (let y = 0; y < height; y += COLUMN_SIZE) {
                    for (let x = 0; x < width; x += COLUMN_SIZE) {
                        this.ctx.beginPath();
                        this.ctx.fillRect(x + 5, y + 5, 2, 2);
                    }
                }
            }

        }

    }

}
