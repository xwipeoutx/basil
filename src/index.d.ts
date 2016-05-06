export interface ReporterOptions {
    quiet?: boolean;
    showTree?: boolean;
    hideStack?: boolean;
}
export declare function test(globs: string[] | string): void;
export declare function options(value: ReporterOptions): void;
export declare function run(globs: string[] | string, reporterOptions: ReporterOptions): void;
