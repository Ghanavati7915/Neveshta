<script setup lang="ts">
//#region Types & Interface
export type TDirection = "normal" | "reverse"
export type TTimingFunction = "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out"
//#endregion

//#region PROPS
// Define props with default values for duration, delay, direction, and timing function
const props = withDefaults(
  defineProps<{
    duration?: number | string,                // Duration of the animation in seconds
    delay?: number | string,                   // Delay before starting the animation in seconds
    direction?: TDirection,           // Direction of the animation (normal or reverse)
    timingFunction?: TTimingFunction  // Speed curve for the animation
  }>(),
  {
    duration: 3,               // Default duration: 3 seconds
    delay: 0,                  // Default delay: 0 seconds
    direction: 'normal',       // Default direction: normal
    timingFunction: "linear"   // Default timing function: linear
  }
)
//#endregion

//#region VARIABLES
// Reference to the marquee content div element for applying styles directly
const marqueeContainer = ref<HTMLDivElement | null>(null);
const marqueeContent = ref<HTMLDivElement | null>(null);
//#endregion

//#region HOOKS
// onMounted hook to apply animation styles after component is mounted
onMounted(() => {
  if (marqueeContent.value && marqueeContainer.value) {
    // گرفتن عرض container و content
    const containerWidth = marqueeContainer.value.offsetWidth;
    const contentWidth = marqueeContent.value.offsetWidth;

    // تنظیمات انیمیشن
    const duration = validateDurationAndDelay(props.duration, 3); // مدت زمان بر اساس props.duration
    const delay = validateDurationAndDelay(props.delay, 0);
    const direction = isValidDirection(props.direction) ? props.direction : 'normal';
    const timingFunction = isValidTimingFunction(props.timingFunction) ? props.timingFunction : 'linear';

    // اعمال تنظیمات انیمیشن
    marqueeContent.value.style.animationDuration = `${duration}s`;
    marqueeContent.value.style.animationTimingFunction = timingFunction;
    marqueeContent.value.style.animationName = 'marqueeAnimation';
    marqueeContent.value.style.animationIterationCount = 'infinite';
    marqueeContent.value.style.animationDirection = direction;
    marqueeContent.value.style.animationDelay = `${delay}s`;

    // ایجاد تگ <style> برای keyframes
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      @keyframes marqueeAnimation {
        0% {
          transform: translateX(${containerWidth + 15}px); /* شروع از خارج container */
        }
        100% {
          transform: translateX(-${contentWidth + 15}px); /* پایان خارج از container */
        }
      }
    `;
    document.head.appendChild(style); // افزودن تگ <style> به <head>
  }
});

//#endregion

//#region FUNCTIONS
// Utility function to validate and return valid duration and delay values
const validateDurationAndDelay = (value: unknown, defaultValue: number): number => {
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  return typeof parsedValue === 'number' && parsedValue > 0 ? parsedValue : defaultValue;
};

// Type guard for direction validation (either 'normal' or 'reverse')
const isValidDirection = (direction: unknown): direction is TDirection => {
  return ['normal', 'reverse'].includes(direction as string);
};

// Type guard for timing function validation (allowing specific CSS timing functions)
const isValidTimingFunction = (timingFunction: unknown): timingFunction is TTimingFunction => {
  return ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].includes(timingFunction as string);
};
//#endregion
</script>

<template>
  <!-- Container for the marquee, holds the animated content -->
  <div ref="marqueeContainer" class="marquee-container">
    <!-- Apply the ref to the actual content that will be animated -->
    <div ref="marqueeContent" class="marquee-content">
      <slot></slot> <!-- Slot for user-provided content -->
    </div>
  </div>
</template>

<style scoped>
/* Styling for the container holding the marquee */
.marquee-container {
  @apply overflow-hidden whitespace-nowrap box-border w-full;
  /* Styling for size and overflow */
}

/* Base styling for the animated content */
.marquee-content {
  display: inline-block; /* Ensure content is treated as inline for animation */
  animation: marqueeAnimation; /* Apply marquee animation */
  white-space: nowrap; /* Prevent content from wrapping */
  padding-top: 1px;
  margin-bottom: -4px;
}

</style>
