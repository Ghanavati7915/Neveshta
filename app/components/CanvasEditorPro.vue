<template>
  <div class="flex flex-col items-center p-4">
    <!-- Canvas -->
    <canvas
        ref="canvas"
        width="500"
        height="500"
        class="border border-gray-300 touch-pan-y"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="endDrag"
    ></canvas>

    <!-- Controls -->
    <div class="mt-4 flex flex-col gap-2 w-full max-w-md">
      <button
          @click="addText"
          class="bg-green-500 text-white p-2 rounded"
      >
        ➕ افزودن متن
      </button>

      <div v-if="selectedText" class="border rounded p-3 mt-3 bg-gray-50">
        <h3 class="font-bold mb-2">ویرایش متن انتخاب‌شده</h3>

        <label>متن:</label>
        <input v-model="selectedText.text" type="text" class="border p-2 rounded w-full" />

        <label>فونت:</label>
        <select v-model="selectedText.font" class="border p-2 rounded w-full">
          <option value="Estedad-Bold">Estedad-Bold</option>
          <option value="Lalezar">Lalezar</option>
          <option value="Cinema">Cinema</option>
          <option value="Sahel">Sahel</option>
          <option value="Shabnam">Shabnam</option>
          <option value="Dast Nevis">DastNevis</option>
          <option value="Digi Darya Bold">Darya</option>
        </select>

        <label>رنگ:</label>
        <input v-model="selectedText.color" type="color" class="w-16 h-8 p-1" />

        <label>سایز:</label>
        <input v-model.number="selectedText.fontSize" type="number" min="10" max="300" class="border p-2 rounded w-full" />

        <label>چرخش:</label>
        <input v-model.number="selectedText.rotation" type="number" min="0" max="360" class="border p-2 rounded w-full" />

        <button
            @click="removeText(selectedText.id)"
            class="bg-red-500 text-white p-2 rounded mt-2"
        >
          حذف متن
        </button>
      </div>

      <button @click="downloadImage" class="bg-blue-500 text-white p-2 rounded mt-3">
        📥 دانلود PNG
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TextItem {
  id: number;
  text: string;
  font: string;
  color: string;
  fontSize: number;
  rotation: number;
  x: number;
  y: number;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const texts = ref<TextItem[]>([]);
const selectedId = ref<number | null>(null);

// برای درگ و جابجایی
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// pinch/rotate
let initialDistance = 0;
let initialAngle = 0;
let initialFontSize = 0;
let initialRotation = 0;

onMounted(() => {
  if (canvas.value) ctx.value = canvas.value.getContext("2d");
  draw();
});

watch(texts, draw, { deep: true });
watch(selectedId, draw);

function draw() {
  if (!ctx.value || !canvas.value) return;
  const c = ctx.value;
  const width = canvas.value.width;
  const height = canvas.value.height;
  c.clearRect(0, 0, width, height);

  texts.value.forEach((t) => {
    c.save();
    c.translate(t.x, t.y);
    c.rotate((t.rotation * Math.PI) / 180);
    c.fillStyle = t.color;
    c.font = `${t.fontSize}px ${t.font}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(t.text, 0, 0);
    c.restore();

    // highlight متن انتخاب‌شده
    if (t.id === selectedId.value) {
      c.save();
      c.strokeStyle = "blue";
      c.lineWidth = 2;
      c.strokeRect(t.x - t.fontSize, t.y - t.fontSize, t.fontSize * 2, t.fontSize * 2);
      c.restore();
    }
  });
}

function addText() {
  const id = Date.now();
  texts.value.push({
    id,
    text: "متن جدید",
    font: "Estedad-Bold",
    color: "#000000",
    fontSize: 60,
    rotation: 0,
    x: 250,
    y: 250,
  });
  selectedId.value = id;
}

function removeText(id: number) {
  texts.value = texts.value.filter((t) => t.id !== id);
  if (selectedId.value === id) selectedId.value = null;
}

// انتخاب متن
function findTextAt(x: number, y: number): TextItem | null {
  const c = ctx.value!;
  for (let i = texts.value.length - 1; i >= 0; i--) {
    const t = texts.value[i];
    c.save();
    c.translate(t.x, t.y);
    c.rotate((t.rotation * Math.PI) / 180);
    c.font = `${t.fontSize}px ${t.font}`;
    const metrics = c.measureText(t.text);
    const w = metrics.width;
    const h = t.fontSize;
    c.restore();

    if (
        x >= t.x - w / 2 &&
        x <= t.x + w / 2 &&
        y >= t.y - h / 2 &&
        y <= t.y + h / 2
    ) {
      return t;
    }
  }
  return null;
}

// 🖱️ موس
function onMouseDown(e: MouseEvent) {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clicked = findTextAt(x, y);
  if (clicked) {
    selectedId.value = clicked.id;
    dragOffset.x = x - clicked.x;
    dragOffset.y = y - clicked.y;
    isDragging = true;
  } else {
    selectedId.value = null;
  }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !selectedText.value || !canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  selectedText.value.x = e.clientX - rect.left - dragOffset.x;
  selectedText.value.y = e.clientY - rect.top - dragOffset.y;
  draw();
}

function endDrag() {
  isDragging = false;
  initialDistance = 0;
  initialAngle = 0;
}

// 📱 لمسی
function onTouchStart(e: TouchEvent) {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();

  if (e.touches.length === 1) {
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const clicked = findTextAt(x, y);
    if (clicked) {
      selectedId.value = clicked.id;
      dragOffset.x = x - clicked.x;
      dragOffset.y = y - clicked.y;
      isDragging = true;
    } else {
      selectedId.value = null;
    }
  } else if (e.touches.length === 2 && selectedText.value) {
    isDragging = false;
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    initialAngle = getAngle(e.touches[0], e.touches[1]);
    initialFontSize = selectedText.value.fontSize;
    initialRotation = selectedText.value.rotation;
  }
}

function onTouchMove(e: TouchEvent) {
  if (!canvas.value || !selectedText.value) return;
  const rect = canvas.value.getBoundingClientRect();

  if (e.touches.length === 1 && isDragging) {
    selectedText.value.x = e.touches[0].clientX - rect.left - dragOffset.x;
    selectedText.value.y = e.touches[0].clientY - rect.top - dragOffset.y;
    draw();
  } else if (e.touches.length === 2) {
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const newAngle = getAngle(e.touches[0], e.touches[1]);

    const scale = newDistance / initialDistance;
    selectedText.value.fontSize = Math.min(Math.max(10, initialFontSize * scale), 300);

    const angleDiff = newAngle - initialAngle;
    selectedText.value.rotation = initialRotation + angleDiff;
    draw();
  }
}

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

function downloadImage() {
  if (!canvas.value) return;
  const link = document.createElement("a");
  link.href = canvas.value.toDataURL("image/png");
  link.download = "text-image.png";
  link.click();
}

const selectedText = computed(() =>
    texts.value.find((t) => t.id === selectedId.value) || null
);
</script>

<style scoped>
canvas {
  touch-action: none;
}
</style>
