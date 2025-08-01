import * as React from "react"

const Button = React.forwardRef(({ className, variant, ...props }, ref) => {
  const baseClassName = "button";
  let variantClassName = "";
  if (variant === "ghost") {
    variantClassName = "button-ghost";
  } else {
    variantClassName = "button-default";
  }
  const finalClassName = `${baseClassName} ${variantClassName} ${className}`;

  return (
    <button
      className={finalClassName}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };