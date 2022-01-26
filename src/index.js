function fitsConstraint(constraints, type, width) {
  const constraint = constraints[type];
  if(constraint) {
    return width >= (constraint.min ?? 0) && width <= (constraint.max ?? Infinity)
  }
  return true;
}

panel.plugin("rasteiner/conditionalblocks", {
  use: [
    function (Vue) {
      const LayoutField = Vue.component("k-layout-field").options;
      const BlockLayouts = LayoutField.components["k-block-layouts"];
      const Layout = BlockLayouts.components["k-layout"];
      const LayoutColumn = Layout.components["k-layout-column"];
      const BlockSelector = Vue.component("k-block-selector").options;
      const Blocks = Vue.component("k-blocks").options;

      Vue.component("k-layout-field", {
        extends: LayoutField,

        provide() {
          return {
            constraints: this.requires,
          };
        },
        props: {
          requires: {
            type: Object,
            required: false,
          },
        },
      });

      LayoutColumn.provide = function () {
        const [num, denum] = this.width.split("/");
        const cwidth = parseInt(num) / parseInt(denum);

        return {
          cwidth,
        };
      };

      Vue.component("k-blocks", {
        extends: Blocks,
        inject: ["constraints", "cwidth"],
        methods: {
          append(what, index) {
            if(this.constraints && this.cwidth && Array.isArray(what)) {
              what = what.filter((block) => fitsConstraint(this.constraints, block.type, this.cwidth));
            }

            Blocks.methods.append.call(this, what, index);
          }
        },
        computed: {
          draggableOptions() {
            const original = Blocks.computed.draggableOptions.call(this);

            if (this.constraints && this.cwidth) {
              //remove fieldsets that are not allowed by constraints
              original.data.fieldsets = Object.fromEntries(
                Object.entries(original.data.fieldsets).filter(([type]) => fitsConstraint(this.constraints, type, this.cwidth))
              );
              console.log(original.data.fieldsets);
            }


            return original;
          },
        },
      });

      BlockSelector.inject = ["constraints", "cwidth"];

      const open = BlockSelector.methods.open;
      BlockSelector.methods.open = function () {
        open.call(this, ...arguments);

        if (!this.constraints || !this.cwidth) return;
        const width = this.cwidth;

        const myDisabled = Object.entries(this.constraints)
          .filter(([_, value]) => {
            return (
              (value.min && width < value.min) ||
              (value.max && width > value.max)
            );
          })
          .map(([key, _]) => key);

        this.disabled = [...this.disabled, ...myDisabled];
      };
    },
  ],
});
