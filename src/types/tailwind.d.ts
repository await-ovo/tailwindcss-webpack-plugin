declare module 'tailwindcss/lib/processTailwindFeatures';

declare module 'tailwind-config-viewer/server';

declare module 'tailwindcss/lib/lib/getModuleDependencies' {
  function getModuleDependencies(file: string): Array<{file:string, requires:string[]}>;

  export = getModuleDependencies;
}
