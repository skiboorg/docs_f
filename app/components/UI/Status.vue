<script setup lang="ts">
import type { IVersionStatus } from "~/repository/document/types";

const props = defineProps<{ status: IVersionStatus }>();

function lightenColor(color: string, amount: number) {
  let c = color.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map(x => x + x).join("");
  }
  const num = parseInt(c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.round(r + (255 - r) * amount);
  g = Math.round(g + (255 - g) * amount);
  b = Math.round(b + (255 - b) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}
</script>

<template>
  <div class="flex items-center gap-2 py-1 px-2  rounded-xl shadow-sm border"
       :style="{
        borderColor: props.status.color,
        backgroundColor: lightenColor(props.status.color, 0.85)
        }">
    <i class="pi text-xs" :class="props.status.icon" :style="{ color: props.status.color }"></i>
    <span class="font-medium text-xs" :style="{ color: props.status.color }">
{{ props.status.label }}
</span>
  </div>
</template>
