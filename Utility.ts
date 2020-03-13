/**
 https://github.com/FelixVogel/Matrix
 Copyright (c) 2020 Felix Vogel

 For the full copyright and license information, please view the LICENSE
 file that was distributed with this source code.
 */

module Utility {

    export class Color {

        public static fromRGBA(r: number, g: number, b: number, a: number = 255): Color {
            return new Color(r, g, b, a);
        }

        public static fromHex(hex: string): Color {
            if (!hex.match(/^#(:?[0-9a-fA-F]{2}){1,3}$/g)) return null;

            let r, g, b;

            hex = hex.substr(1);

            for (let i = 0; i < hex.length; i += 2) {
                let parsed = parseInt(hex.substr(i, 2), 16);
                switch (i) {
                    case 0: {
                        r = parsed;
                        break;
                    }

                    case 2: {
                        g = parsed;
                        break;
                    }

                    case 4: {
                        b = parsed;
                        break;
                    }

                    default:
                        break;
                }

            }

            return new Color(r, g, b);
        }

        // Class

        private readonly r: number;
        private readonly g: number;
        private readonly b: number;
        private readonly a: number;

        constructor(r: number, g: number, b: number, a: number = 255) {
            this.r = Math.max(0, Math.min(255, r));
            this.g = Math.max(0, Math.min(255, g));
            this.b = Math.max(0, Math.min(255, b));
            this.a = Math.max(0, Math.min(255, a));
        }

        public toRGBA(a: number = this.a): string {
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${a})`;
        }

        public toRGB(): string {
            return `rgb(${this.r}, ${this.g}, ${this.b})`;
        }

        public toHex(): string {
            return `#${(this.r < 16 ? '0' : '') + this.r.toString(16)}${(this.g < 16 ? '0' : '') + this.g.toString(16)}${(this.b < 16 ? '0' : '') + this.b.toString(16)}`;
        }

    }

    export class Cookie {

        public static get(name: string): Cookie {
            let index = document.cookie.indexOf(`${name}=`);

            if (index === -1) return null;

            let s = document.cookie.substr(index);

            if (s.indexOf('; ') !== -1) s = s.substring(0, s.indexOf('; '));

            let split = s.split('=');

            return new Cookie(split[0], split[1]);
        }

        public static getOrSet(name: string, defaultValue: string, date?: Date): Cookie {
            let cookie = Cookie.get(name);

            if (!cookie) {
                cookie = new Cookie(name, defaultValue);

                cookie.setExpirationDate(date).add();
            }

            return cookie;
        }

        public static replace(name: string, value: string, date?: Date): void {
            new Cookie(name, value).setExpirationDate(date).add();
        }

        // Class

        private readonly name: string;

        private value: string;
        private expires: Date;

        private constructor(name: string, value: string) {
            this.name = name;
            this.value = value;
            this.expires = new Date();

            // Cookie by default 7 days valid
            this.expires.setTime(this.expires.getTime() + (7 * 24 * 60 * 60 * 1000));
        }

        public setExpirationDate(date: Date): Cookie {
            if (date) this.expires = date;

            return this;
        }

        public getName(): string {
            return this.name;
        }

        public getValue(): string {
            return this.value;
        }

        public setValue(value: string): Cookie {
            this.value = value;
            return this;
        }

        public add(): void {
            document.cookie = `${this.name}=${this.value}; expires=${this.expires.toUTCString()}; path=/`;
        }

        public remove(): void {
            let date = new Date();

            date.setTime(date.getTime() - (24 * 60 * 60 * 1000));

            document.cookie = `${this.name}=; expires=${date.toUTCString()}; path=/`;
        }

    }

    export function forEach<T>(array: T[], callback: (item: T, index?: number) => void): void {
        for (let i = 0, l = array.length; i < l; i ++) {
            callback(array[i], i);
        }
    }

    export function capsule(func: () => void): void {
        func();
    }

}