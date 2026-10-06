<script setup>
// Shared avatar: a real photo when the account has one (currently only
// ever set from Google's ID token "picture" claim -- see the backend's
// AuthService.login_with_google), falling back to the existing colored
// initials circle otherwise. Also falls back if the photo URL fails to
// load (Google photo URLs are normally stable, but never guaranteed --
// e.g. the user removed their Google photo since signing up).
const props = defineProps({
  pictureUrl: { type: String, default: null },
  initials: { type: String, required: true },
  // The exact size/text classes each call site already used for its
  // initials circle (e.g. "h-9 w-9 text-xs font-bold") -- applied to both
  // the photo and the fallback circle so swapping one for the other never
  // shifts the layout. The photo ignores the text-only classes in it.
  circleClass: { type: String, required: true },
})

const imgFailed = ref(false)
// Reset the failure flag if the URL itself changes (e.g. auth.user is
// refetched with a different value) so a stale failure doesn't stick.
watch(
  () => props.pictureUrl,
  () => {
    imgFailed.value = false
  }
)
</script>

<template>
  <img
    v-if="pictureUrl && !imgFailed"
    :src="pictureUrl"
    alt=""
    class="shrink-0 rounded-full object-cover"
    :class="circleClass"
    @error="imgFailed = true"
  />
  <span
    v-else
    class="flex shrink-0 items-center justify-center rounded-full bg-brand"
    :class="circleClass"
  >
    {{ initials }}
  </span>
</template>
