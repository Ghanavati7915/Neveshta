<template>
  <div class="flex flex-col items-center p-4">
    <!-- Canvas -->
    <canvas
        ref="canvas"
        width="500"
        height="500"
        class="border border-gray-300 touch-pan-y"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startTouch"
        @touchmove="onTouch"
        @touchend="endDrag"
    ></canvas>

    <!-- Controls -->
    <div class="mt-4 flex flex-col gap-2 w-full max-w-md">
      <label>متن:</label>
      <input v-model="text" type="text" class="border p-2 rounded" />

      <label>فونت:</label>
      <select v-model="font" class="border p-2 rounded">
        <option value="MyFont">MyFont</option>
        <option value="Estedad-Bold">Estedad-Bold</option>
        <option value="Lalezar">Lalezar</option>
        <option value="Cinema">Cinema</option>
        <option value="Sahel">Sahel</option>
        <option value="Shabnam">Shabnam</option>
        <option value="Dast Nevis">DastNevis</option>
        <option value="Digi Darya Bold">Darya</option>
      </select>

      <label>رنگ:</label>
      <input v-model="color" type="color" class="w-16 h-8 p-1" />

      <label>سایز:</label>
      <input v-model.number="fontSize" type="number" min="10" max="300" class="border p-2 rounded" />

      <label>چرخش:</label>
      <input v-model.number="rotation" type="number" min="0" max="360" class="border p-2 rounded" />

      <button @click="downloadImage" class="bg-blue-500 text-white p-2 rounded mt-2">
        دانلود PNG
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const text = ref("متن شما");
const font = ref("MyFont");
const color = ref("#000000");
const fontSize = ref(80);
const rotation = ref(0);

const pos = ref({ x: 250, y: 250 }); // مرکز
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// برای pinch/rotate
let initialDistance = 0;
let initialRotation = 0;
let initialFontSize = 0;
let initialAngle = 0;

onMounted(() => {
  if (canvas.value) ctx.value = canvas.value.getContext("2d");
  draw();
});

// رندر دوباره در تغییرات
watch([text, font, color, fontSize, rotation], draw);
watch(pos, draw, { deep: true });

function draw() {
  if (!ctx.value || !canvas.value) return;
  const c = ctx.value;
  const width = canvas.value.width;
  const height = canvas.value.height;

  // پاک کردن canvas (شفاف)
  c.clearRect(0, 0, width, height);

  // تنظیمات متن
  c.save();
  c.translate(pos.value.x, pos.value.y);
  c.rotate((rotation.value * Math.PI) / 180);
  c.fillStyle = color.value;
  c.font = `${fontSize.value}px ${font.value}`;
  c.textAlign = "center";
  c.textBaseline = "middle";

  c.fillText(text.value, 0, 0);
  c.restore();
}

// 🖱️ Drag با موس
function startDrag(e: MouseEvent) {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left - pos.value.x;
  dragOffset.y = e.clientY - rect.top - pos.value.y;
  isDragging = true;
}

function onDrag(e: MouseEvent) {
  if (!isDragging || !canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  pos.value.x = e.clientX - rect.left - dragOffset.x;
  pos.value.y = e.clientY - rect.top - dragOffset.y;
  draw();
}

function endDrag() {
  isDragging = false;
  initialDistance = 0;
  initialAngle = 0;
}

// 📱 Drag + Pinch + Rotate
function startTouch(e: TouchEvent) {
  if (!canvas.value) return;
  if (e.touches.length === 1) {
    // یک انگشتی = درگ
    const rect = canvas.value.getBoundingClientRect();
    const touch = e.touches[0];
    dragOffset.x = touch.clientX - rect.left - pos.value.x;
    dragOffset.y = touch.clientY - rect.top - pos.value.y;
    isDragging = true;
  } else if (e.touches.length === 2) {
    // دو انگشتی = pinch + rotate
    isDragging = false;
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    initialAngle = getAngle(e.touches[0], e.touches[1]);
    initialFontSize = fontSize.value;
    initialRotation = rotation.value;
  }
}

function onTouch(e: TouchEvent) {
  if (!canvas.value) return;
  if (e.touches.length === 1 && isDragging) {
    // درگ
    const rect = canvas.value.getBoundingClientRect();
    const touch = e.touches[0];
    pos.value.x = touch.clientX - rect.left - dragOffset.x;
    pos.value.y = touch.clientY - rect.top - dragOffset.y;
    draw();
  } else if (e.touches.length === 2) {
    // pinch + rotate
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const newAngle = getAngle(e.touches[0], e.touches[1]);

    const scale = newDistance / initialDistance;
    fontSize.value = Math.min(Math.max(10, initialFontSize * scale), 300);

    const angleDiff = newAngle - initialAngle;
    rotation.value = initialRotation + angleDiff;

    draw();
  }
}

// helper functions
function getDistance(t1: Touch, t2: Touch) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(t1: Touch, t2: Touch) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// دانلود PNG
function downloadImage() {
  if (!canvas.value) return;
  const link = document.createElement("a");
  link.href = canvas.value.toDataURL("image/png");
  link.download = "text-image.png";
  link.click();
}
</script>

<style scoped>
canvas {
  touch-action: none; /* برای پشتیبانی لمس در موبایل */
}
</style>
