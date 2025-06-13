declare module 'virtual:__federation__' {
  export function __federation_method_getRemote(remoteName: string, exposedModule: string): Promise<any>;
  export function __federation_method_unwrapDefault(mod: any): any;
  export function __federation_method_setRemote(
    remoteName: string,
    options: { url: any; format: string; from: string }
  ): any;
}

declare module 'vite_remote/*';
