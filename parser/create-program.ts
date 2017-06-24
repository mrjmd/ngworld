import * as ts from 'typescript';
import { cyan, green } from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { dirname } from 'path';

export const normalizeOptions = (options: any, configFilePath: string) => {
  options.genDir = options.basePath = options.baseUrl;
  options.configFilePath = configFilePath;
};

export const createProgramFromTsConfig = (configFile: string, overrideFiles: string[] = undefined): ts.Program => {
  console.log(cyan('📝  Creating a program...'));
  const projectDirectory = dirname(configFile);
  console.log('project directory: ' + projectDirectory);
  const { config } = ts.readConfigFile(configFile, ts.sys.readFile);

  // Any because of different APIs in TypeScript 2.1 and 2.0
  const parseConfigHost: any = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: (file) => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true,
  };
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, projectDirectory);
  console.log('parsed: ' + parsed);
  parsed.options.baseUrl = parsed.options.baseUrl || projectDirectory;
  normalizeOptions(parsed.options, configFile);
  const host = ts.createCompilerHost(parsed.options, true);
  console.log('host ready');
  const program = ts.createProgram(overrideFiles || parsed.fileNames, parsed.options, host);

  console.log(green('✅  Program created!'));

  return program;
};
