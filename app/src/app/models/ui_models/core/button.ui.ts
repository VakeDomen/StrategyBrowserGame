import { Drawable } from "../../core/drawable.abstract";

export class Button implements Drawable {
    private _visible: boolean;
    private _isClicked: boolean;
    private _hovered: boolean;
    private _disabled: boolean;
    
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;

    private _background: HTMLImageElement;
    private _backgroundClicked: HTMLImageElement;
    private _icon: HTMLImageElement;
    
    constructor(x: number, y: number, width: number, height: number, color?: number, iconPath?: string) {
        this._visible = true;
        this._isClicked = false;
        this._hovered = false;
        this._disabled = false;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._background = new Image();
        this._backgroundClicked = new Image();
        this._icon = new Image();
        this._background.src = this.getBackground(color);
        this._backgroundClicked.src = this.getBackgroundClicked(color);
        this._icon.src = this.getIcon(iconPath);
    }
    
    update(x: number, y: number): void {
        this.hovered = this.checkHover(x, y);
    }

    async load(): Promise<void> {
        await Promise.all([
            this._background.onload,
            this._backgroundClicked.onload,
            this._icon.onload,
        ]);
        await this.afterLoad();
    }


    private getIcon(icon: string | undefined): string {
        if (icon) {
            return icon;
        } else {
            return "../../../assets/ui/tick_icon.png";
        }
    }

    private getBackground(color: number | undefined): string {
        switch (color) {
            case 0:
                return "../../../assets/ui/grey.png";
            case 1:
                return "../../../assets/ui/yellow.png";
            case 2:
                return "../../../assets/ui/green.png";
            case 3:
                return "../../../assets/ui/red.png";
            case 4:
                return "../../../assets/ui/blue.png";
            default:
                return "../../../assets/ui/grey.png";
        }
    }

    private getBackgroundClicked(color: number | undefined): string {
        switch (color) {
            case 0:
                return "../../../assets/ui/grey_pressed.png";
            case 1:
                return "../../../assets/ui/yellow_pressed.png";
            case 2:
                return "../../../assets/ui/green_pressed.png";
            case 3:
                return "../../../assets/ui/red_pressed.png";
            case 4:
                return "../../../assets/ui/blue_pressed.png";
            default:
                return "../../../assets/ui/grey_pressed.png";
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.preDraw(ctx);
        if (!this._visible) {
            return;
        }
        if (this._disabled) {
            ctx.globalAlpha = 0.6;
        }

        let img = this._background;
        if (this._hovered && !this._disabled) {
            this.drawHover(ctx)
        }
        if (this._isClicked && !this._disabled) {
            img = this._backgroundClicked;
        }
        ctx.drawImage(
            img, 
            this._x, 
            this._y, 
            this._width, 
            this._height
        );
        if (this.disabled) {
            ctx.globalAlpha = 1;
        }
        this.drawIcon(ctx);
        this.afterDraw(ctx);
    }

    protected preDraw(ctx: CanvasRenderingContext2D): void {
        return;
    }

    protected afterDraw(ctx: CanvasRenderingContext2D): void {
        return;
    }

    protected async afterLoad() {}


    protected drawHover(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.fillRect(
            this._x - 1 , 
            this._y -1, 
            this._width + 2, 
            this._height + 2
        );
        ctx.fillStyle = 'black';
    }

    protected drawIcon(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(
            this._icon, 
            this._x + 5, 
            this._y + 5, 
            this._width - 10, 
            this._height - 10
        );
    }

    protected checkHover(x: number, y: number): boolean {
        this._hovered = x >= this._x && 
            x <= this._x + this._width && 
            y >= this._y &&
            y <= this._y + this._height;
        return this._hovered;
    }

    handleClick(): boolean {
        if (this.hovered && this.visible && !this.disabled) {
            alert('Clicked!');
            return true;
        }
        return false;
    }

    public get disabled(): boolean {
        return this._disabled;
    }
    public set disabled(value: boolean) {
        this._disabled = value;
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
    public get isClicked(): boolean {
        return this._isClicked;
    }
    public set isClicked(value: boolean) {
        this._isClicked = value;
    }
    public get hovered(): boolean {
        return this._hovered;
    }
    public set hovered(value: boolean) {
        this._hovered = value;
    }
    protected get icon(): HTMLImageElement {
        return this._icon;
    }
    protected set icon(value: HTMLImageElement) {
        this._icon = value;
    }
}