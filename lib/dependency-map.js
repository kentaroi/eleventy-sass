const debug = require("debug")("EleventySass:DependencyMap");
const debugDev = require("debug")("Dev:EleventySass:DependencyMap");

class DependencyMap {
  constructor() {
    this.dependenciesByDependant = new Map();
    this.dependantsByDependency = new Map();
  }

  update(dependant, dependencies) {
    if (this.dependenciesByDependant.has(dependant)) {
      let currentDeps = this.dependenciesByDependant.get(dependant)
      if (
        currentDeps.size === dependencies.length &&
        dependencies.every(e => currentDeps.has(e))
      ) { // If no change
        debugDev(`Dependencies for ${ dependant } is not changed: [${ dependencies }]`);
        return;
      }

      let oldDependencies = [...currentDeps].filter(e => !dependencies.includes(e));
      for (let dependency of oldDependencies) {
        this.dependantsByDependency.get(dependency)?.delete(dependant);
      }
    }
    this.dependenciesByDependant.set(dependant, new Set(dependencies));
    for (let dependency of dependencies) {
      if (this.dependantsByDependency.has(dependency)) {
        this.dependantsByDependency.get(dependency)?.add(dependant);
      } else {
        this.dependantsByDependency.set(dependency, new Set([dependant]));
      }
    }
    debug(`Updated dependencies for ${ dependant }: [${ dependencies }]`);
    debugDev("New DependencyMap: %O", this.dependenciesByDependant);
  }

  dependantsOf(dependency) {
    return this.dependantsByDependency.get(dependency) ?? new Set();
  }

  dependenciesOf(dependant) {
    return this.dependenciesByDependant.get(dependant) ?? new Set();
  }

  hasDependency(dependant, dependency) {
    return this.dependantsByDependency.get(dependency)?.has(dependant) ?? false;
  }

  *[Symbol.iterator]() {
    yield* this.dependenciesByDependant;
  }
}

module.exports = new DependencyMap();
