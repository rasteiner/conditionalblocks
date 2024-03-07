function fitsConstraint(constraints, type, width) {
  const constraint = constraints[type];
  if(constraint) {
    return width >= (constraint.min ?? 0) && width <= (constraint.max ?? Infinity)
  }
  return true;
}

const cache = new WeakMap();

function createProxyForBlocks(blocks) {
	if(cache.has(blocks)) {
		return cache.get(blocks);
	}

	const {constraints, cwidth} = blocks;

	return cache.set(blocks, new Proxy(blocks, {
		get(target, key) {
			if(key === 'fieldsets') {
				return Object.fromEntries(
					Object.entries(target.fieldsets).filter(([type]) => fitsConstraint(constraints, type, cwidth))
				);
			}
			return target[key];
		}
	})).get(blocks);
}

panel.plugin("rasteiner/conditionalblocks", {

  use: [
    function (Vue) {
      const LayoutField = Vue.component("k-layout-field").options;
      const LayoutColumn = Vue.component("k-layout-column").options;
      const Blocks = Vue.component("k-blocks").options;

      LayoutField.provide = function() {
				return {
					constraints: (this.requires && !Array.isArray(this.requires)) ? this.requires : {},
				};
			};

			LayoutField.props.requires = {
				type: Object|Array,
				required: false,
			};

			LayoutColumn.provide = function() {
				const [num, denum] = this.width.split("/");
				const cwidth = parseInt(num) / parseInt(denum);

				return {
					cwidth,
				};
			};

			Blocks.inject = {
				constraints: {
					from: "constraints",
					default: {},
				},
				cwidth: {
					from: "cwidth",
					default: null,
				},
			};

			for(const fn of ['choose', 'chooseToConvert']) {
				const orig = Blocks.methods[fn];
				Blocks.methods[fn] = function(...args) {
					// If I'm in a column with constraints
					if(Object.entries(this.constraints).length > 0 && this.cwidth) {
						// create a proxy for `this` that returns a filtered set of fieldsets
						const proxy = createProxyForBlocks(this);

						// and call the original method on the proxy
						Reflect.apply(orig, proxy, args);
					} else {

						// otherwise call the method on the original object
						Reflect.apply(orig, this, args);
					}
				};
			}

			Blocks.methods.canAcceptBlockType = function(type) {
				if(!type in this.fieldsets) return false;
				if(!type in this.constraints) return true;

				return fitsConstraint(this.constraints, type, this.cwidth);
			}

			const move = Blocks.methods.move;
			Blocks.methods.move = function(event) {
				if(Reflect.apply(move, this, arguments)) {
					let target = event.relatedContext.component;
					while(target && !target.canAcceptBlockType) target = target.$parent;
					const block = event.draggedContext.element;
					return target?.canAcceptBlockType(block.type) ?? false;
				}

				return false;
			};
    },
  ],
});
