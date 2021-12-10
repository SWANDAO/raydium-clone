const Button = {
  // The styles all button have in common
  baseStyle: {
    borderRadius: "base", // <-- border radius is same for all variants and sizes
  },
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: "sm",
      px: 4, // <-- px is short for paddingLeft and paddingRight
      py: 3, // <-- py is short for paddingTop and paddingBottom
    },
    md: {
      fontSize: "md",
      px: 6, // <-- these values are tokens from the design system
      py: 4, // <-- these values are tokens from the design system
    },
  },

  // Two variants: outline and solid
  variants: {
    outline: {
      border: "1px solid",
      borderColor: "#5ac4be",
      color: "white",
    },
    solid: {
      bg: "purple.500",
      color: "white",
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
    variant: "outline",
    focusBorderColor: "transparent",
    activeBorderColor: "transparent",
    hover: {
      bg: "transparent",
    },
  },
};

export default Button;
