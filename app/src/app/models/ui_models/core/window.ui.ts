import { Drawable } from "../../core/drawable.abstract";
import { Game } from "../../game";

export class Window implements Drawable {
    
    protected static ANIMATION_SPEED: number = 30;
    protected static HEADER_HEIGHT: number = 20;
    protected static HEADER_START_WIDTH: number = 20;
    protected static HEADER_END_WIDTH: number = 20;
    protected static TITLE_SIZE: number = 14;

    private _visible: boolean;
    private _isClicked: boolean;
    private _isHovered: boolean;
    private _hoverX: number | undefined;
    private _hoverY: number | undefined;

    private _x: number;
    private _y: number;
    private _originX: number;
    private _originY: number;
    private _goalX: number;
    private _goalY: number;
    private _width: number;
    private _height: number;
    private _title: string;
    
    private spritesheet: HTMLImageElement;
    private background: [HTMLImageElement, number, number, number, number];
    private headerStart: [HTMLImageElement, number, number, number, number];
    private headerMiddle: [HTMLImageElement, number, number, number, number];
    private headerClose: [HTMLImageElement, number, number, number, number];
    private closeButton: [HTMLImageElement, number, number, number, number];

    private colorOffset: [number, number][] = [
        [1, 0], // white
        [108, 0], // yellow
        [216, 0], // green 
        [324, 0], // orange
        [432, 0], // blue
    ];

    private closeButtonCoords: [number, number] = [55, 109]
    private headerStartCoords: [number, number] = [0, 0]
    private headerMiddleCoords: [number, number] = [18, 0]
    private headerCloseCoords: [number, number] = [36, 0]

    constructor(x: number, y: number, width: number, height: number, title: string, color?: number) {
        this._visible = true;
        this._isClicked = false;
        this._isHovered = false;
        this._x = x;
        this._y = y;
        this._originX = x;
        this._originY = y;
        this._goalX = x;
        this._goalY = y;
        this._width = width;
        this._height = height;
        this._title = title;
        if (!color || color > 4) {
            color = 0;
        }
        this.spritesheet = new Image();
        this.background = [...this.getBackground(color)];
        this.headerStart = [this.spritesheet, ...this.getHeaderStart(color)];
        this.headerMiddle = [this.spritesheet, ...this.getHeaderMiddle(color)];
        this.headerClose = [this.spritesheet, ...this.getHeaderEnd(color)];
        this.closeButton = [this.spritesheet, ...this.getCloseButton(color)];

        this.spritesheet.src = "../../../assets/ui/spritesheet.png";
    }

    protected handleClose(x: number, y: number): void {
        if (
            x > this.x + this.width - Window.HEADER_END_WIDTH &&
            y > this.y &&
            x < this.x + this.width - Window.HEADER_END_WIDTH + Window.HEADER_END_WIDTH &&
            y < this.y + Window.HEADER_HEIGHT
        ) {
            this.onClose()
            Game.state = 'view';
        }
    }

    protected handleBodyClick(x: number, y: number): void {
        return;
    }

    handleClick(x: number, y: number): void {
        this.handleClose(x, y);
        this.handleBodyClick(x, y);
    }

    checkBodyHover(x: number, y: number): void {
        return;
    }

    checkHover(x: number, y: number): boolean {
        this.isHovered = x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
        if (this.isHovered) {
            this.hoverX = x;
            this.hoverY = y;
        }
        this.checkBodyHover(x, y);
        return this.isHovered;
    }

    setClicked(b: boolean) {
        this.isClicked = b;
    }

    async load(): Promise<void> {
        await Promise.all([
            this.spritesheet.onload,
            this.background[0].onload,
        ])
    }
    private getBackground(background: number | undefined): [HTMLImageElement, number, number, number, number] {
        const bg = new Image();
        switch (background) {
            case 0:
                bg.src = "../../../assets/ui/grey_pressed.png";
                break;
            case 1:
                bg.src = "../../../assets/ui/yellow_pressed.png";
                break;
            case 2:
                bg.src = "../../../assets/ui/green_pressed.png";
                break;
            case 3:
                bg.src = "../../../assets/ui/red_pressed.png";
                break;
            case 4:
                bg.src = "../../../assets/ui/blue_pressed.png";
                break;
            default:
                bg.src = "../../../assets/ui/grey_pressed.png";
                break;
        }
        return [bg, 0, 0, 30, 30];
    }
    private getHeaderStart(color: number): [number, number, number, number] {
        return [
            this.headerStartCoords[0] + this.colorOffset[color][0], 
            this.headerStartCoords[1] + this.colorOffset[color][1], 
            15, 
            15
        ];
    }
    private getHeaderMiddle(color: number): [number, number, number, number] {
        return [
            this.headerMiddleCoords[0] + this.colorOffset[color][0], 
            this.headerMiddleCoords[1] + this.colorOffset[color][1], 
            14, 
            15
        ];
    }
    private getHeaderEnd(color: number): [number, number, number, number] {
        return [
            this.headerCloseCoords[0] + this.colorOffset[color][0], 
            this.headerCloseCoords[1] + this.colorOffset[color][1], 
            15, 
            15
        ];
    }
    private getCloseButton(color: number): [number, number, number, number] {
        return [
            this.closeButtonCoords[0] + this.colorOffset[color][0], 
            this.closeButtonCoords[1] + this.colorOffset[color][1], 
            15, 
            15
        ];
    }

    protected calculateAnimationStep(): void {
        if (this.x != this.goalX || this.y != this.goalY) {
            if (this.x != this.goalX  && Math.abs(this.x - this.goalX) > Window.ANIMATION_SPEED) {
                this.x += this.x < this.goalX ? Window.ANIMATION_SPEED : -Window.ANIMATION_SPEED;
            } else if (this.x != this.goalX ) {
                this.x = this.goalX;
            }
            if (this.y != this.goalY  && Math.abs(this.y - this.goalY) > Window.ANIMATION_SPEED) {
                this.y += this.y < this.goalY ? Window.ANIMATION_SPEED : -Window.ANIMATION_SPEED;
            } else if (this.y != this.goalY ) {
                this.y = this.goalY;
            }
        }
    }

    protected drawBackground(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(
            this.background[0], 
            this.x, 
            this.y, 
            this.width,
            this.height
        );
    }
    protected drawHeader(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(
            ...this.headerStart, 
            this.x, 
            this.y, 
            Window.HEADER_START_WIDTH, 
            Window.HEADER_HEIGHT 
        );
        ctx.drawImage(
            ...this.headerMiddle, 
            this.x + Window.HEADER_START_WIDTH, 
            this.y, 
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH, 
            Window.HEADER_HEIGHT 
        );
        ctx.drawImage(
            ...this.headerClose, 
            this.x + this.width - Window.HEADER_END_WIDTH, 
            this.y, 
            Window.HEADER_END_WIDTH, 
            Window.HEADER_HEIGHT 
        );
        ctx.font = `${Window.TITLE_SIZE}px Arial`;
        ctx.fillText(
            `${this._title}`, 
            this.x + Window.HEADER_START_WIDTH, 
            this.y + Window.HEADER_HEIGHT - 5,
            this.width - Window.HEADER_START_WIDTH - Window.HEADER_END_WIDTH
        );
        ctx.drawImage(
            ...this.closeButton, 
            this.x + this.width - Window.HEADER_END_WIDTH, 
            this.y, 
            Window.HEADER_END_WIDTH, 
            Window.HEADER_HEIGHT 
        );
    }
    protected drawBody(ctx: CanvasRenderingContext2D): void {
        return;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const isAnimating = this.x != this.goalX || this.y != this.goalY;
        this.calculateAnimationStep();
        const animationCompleted = isAnimating && this.x == this.goalX && this.y == this.goalY;
        this.drawBackground(ctx);
        this.drawHeader(ctx);
        this.drawBody(ctx);
        if (animationCompleted) {
            this.animationCompleted();
        }
    }

    protected animationCompleted(): void {
        return
    }

    protected onClose() {
        this.goalX = this.originX;
        this.goalY = this.originY;
    }
    
    public get visible(): boolean {
        return this._visible;
    }
    public set visible(value: boolean) {
        this._visible = value;
    }
    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
    }
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
    }
    public get goalX(): number {
        return this._goalX;
    }
    public set goalX(value: number) {
        this._goalX = value;
    }
    public get goalY(): number {
        return this._goalY;
    }
    public set goalY(value: number) {
        this._goalY = value;
    }
    public get width(): number {
        return this._width;
    }
    public set width(value: number) {
        this._width = value;
    }
    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        this._height = value;
    }
    public get title_1(): string {
        return this._title;
    }
    public set title_1(value: string) {
        this._title = value;
    }
    public get title(): string {
        return this._title;
    }
    public set title(value: string) {
        this._title = value;
    }
    public get isClicked(): boolean {
        return this._isClicked;
    }
    public set isClicked(value: boolean) {
        this._isClicked = value;
    }
    public get isHovered(): boolean {
        return this._isHovered;
    }
    public set isHovered(value: boolean) {
        this._isHovered = value;
    }
    public get originX(): number {
        return this._originX;
    }
    public set originX(value: number) {
        this._originX = value;
    }
    public get originY(): number {
        return this._originY;
    }
    public set originY(value: number) {
        this._originY = value;
    }
    public get hoverX(): number | undefined {
        return this._hoverX;
    }
    public set hoverX(value: number | undefined) {
        this._hoverX = value;
    }
    public get hoverY(): number | undefined {
        return this._hoverY;
    }
    public set hoverY(value: number | undefined) {
        this._hoverY = value;
    }
}