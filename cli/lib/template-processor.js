const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');

/**
 * Procesa un archivo de template con Mustache
 */
async function processTemplateFile(templatePath, outputPath, variables) {
  try {
    // Leer el archivo template
    const content = await fs.readFile(templatePath, 'utf-8');

    // Procesar con Mustache
    const processed = Mustache.render(content, variables);

    // Escribir el archivo procesado
    await fs.writeFile(outputPath, processed, 'utf-8');

    return true;
  } catch (error) {
    throw new Error(`Error processing template ${templatePath}: ${error.message}`);
  }
}

/**
 * Procesa un directorio completo de templates
 */
async function processTemplateDirectory(sourceDir, targetDir, variables, options = {}) {
  const {
    skipExtensions = [],
    processExtensions = ['.md', '.json', '.py', '.js', '.ts', '.tsx', '.yml', '.yaml', '.sh'],
    removeTmplExtension = true
  } = options;

  const results = {
    processed: [],
    copied: [],
    errors: []
  };

  try {
    // Asegurar que el directorio destino existe
    await fs.ensureDir(targetDir);

    // Leer contenido del directorio
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      let targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        // Procesar subdirectorio recursivamente
        const subResults = await processTemplateDirectory(sourcePath, targetPath, variables, options);
        results.processed.push(...subResults.processed);
        results.copied.push(...subResults.copied);
        results.errors.push(...subResults.errors);
      } else {
        const ext = path.extname(entry.name);
        const isTmpl = entry.name.endsWith('.tmpl');

        // Si es .tmpl, remover la extensión en el archivo de salida
        if (isTmpl && removeTmplExtension) {
          targetPath = targetPath.replace(/\.tmpl$/, '');
        }

        // Determinar si debemos procesar este archivo
        const shouldProcess = isTmpl || processExtensions.includes(ext);
        const shouldSkip = skipExtensions.includes(ext);

        if (shouldSkip) {
          // Copiar sin procesar (solo si source y target son diferentes)
          if (sourcePath !== targetPath) {
            await fs.copy(sourcePath, targetPath);
            results.copied.push(targetPath);
          }
        } else if (shouldProcess) {
          // Procesar con Mustache
          try {
            await processTemplateFile(sourcePath, targetPath, variables);
            results.processed.push(targetPath);
          } catch (error) {
            results.errors.push({
              file: sourcePath,
              error: error.message
            });
          }
        } else {
          // Copiar archivos binarios u otros sin procesar (solo si source y target son diferentes)
          if (sourcePath !== targetPath) {
            await fs.copy(sourcePath, targetPath);
            results.copied.push(targetPath);
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Error processing directory ${sourceDir}: ${error.message}`);
  }
}

/**
 * Procesa un string directamente con Mustache
 */
function processTemplateString(template, variables) {
  return Mustache.render(template, variables);
}

/**
 * Verifica si un archivo contiene variables de template
 */
async function hasTemplateVariables(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return /\{\{[^}]+\}\}/.test(content);
  } catch (error) {
    return false;
  }
}

/**
 * Encuentra todos los archivos con variables de template en un directorio
 */
async function findTemplateFiles(dir, extensions = ['.md', '.json', '.py', '.js', '.ts', '.tsx']) {
  const templateFiles = [];

  async function scanDirectory(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext) || entry.name.endsWith('.tmpl')) {
          const hasVars = await hasTemplateVariables(fullPath);
          if (hasVars) {
            templateFiles.push(fullPath);
          }
        }
      }
    }
  }

  await scanDirectory(dir);
  return templateFiles;
}

module.exports = {
  processTemplateFile,
  processTemplateDirectory,
  processTemplateString,
  hasTemplateVariables,
  findTemplateFiles
};
