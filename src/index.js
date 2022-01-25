panel.plugin("rasteiner/conditionalblocks", {
  use: [
    function (Vue) {
      const LayoutField = Vue.component("k-layout-field").options;
      const BlockLayouts = LayoutField.components["k-block-layouts"];
      const Layout = BlockLayouts.components["k-layout"];
      const LayoutColumn = Layout.components["k-layout-column"];
      const BlockSelector = Vue.component("k-block-selector").options;

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
        return {
          width: this.width,
        };
      };

      BlockSelector.inject = ["constraints", "width"];

      const open = BlockSelector.methods.open;
      BlockSelector.methods.open = function () {
        open.call(this, ...arguments);

        if (!this.constraints || !this.width) return;

        const [num, denum] = this.width.split("/");
        const width = parseInt(num) / parseInt(denum);

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
