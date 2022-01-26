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

      const draggableOptions = Blocks.computed.draggableOptions;
      delete Blocks.computed.draggableOptions;

      Vue.component("k-blocks", {
        extends: Blocks,
        inject: ["constraints", "cwidth"],
        computed: {
          draggableOptions() {
            const original = draggableOptions.call(this);

            if (this.constraints && this.cwidth) {
              //remove fieldsets that are not allowed by constraints
              original.data.fieldsets = Object.fromEntries(
                Object.entries(original.data.fieldsets).filter(([type]) => {
                  const constraint = this.constraints[type];
                  return !(
                    (constraint?.min && this.cwidth < constraint.min) ||
                    (constraint?.max && this.cwidth > constraint.max)
                  );
                })
              );
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
