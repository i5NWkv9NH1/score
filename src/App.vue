<script
  setup
  lang="ts"
>
import { lintGutter } from '@codemirror/lint';
import 'abcjs/abcjs-audio.css';
import { EditorView, basicSetup, } from 'codemirror';
import { onMounted, ref } from 'vue';
import { decodeScore, updateScore } from './core';
import { AbcLanguageSupport } from './language';
import { loadAudioController } from './music';
import { delayed } from './util';

const headerActions = ref([
  { name: 'share', icon: 'tabler:brand-stackshare', action: () => { } },
  { name: 'faq', icon: 'tabler:question-mark', action: () => { } },
])
const score = ref(decodeScore())
const editor = ref<EditorView>()
const editorWrapper = ref<HTMLElement>()
const scoreWrapper = ref<HTMLElement>()

onMounted(() => {
  if (!editorWrapper.value) return
  const synthControl = loadAudioController('#audio', '#score')

  editor.value = new EditorView({
    doc: score.value,
    extensions: [
      basicSetup,
      AbcLanguageSupport,
      lintGutter(),
      EditorView.lineWrapping,
      EditorView.updateListener.of(
        delayed(300, (e) => {
          if (!e.docChanged) return
          const score = e.state.doc.toString()
          updateScore(score, scoreWrapper.value!, synthControl!, editor.value!, e.state)
        })
      )
    ],
    parent: editorWrapper.value
  })

  updateScore(score.value!, scoreWrapper.value!, synthControl!, editor.value!, editor.value.state)
})

</script>

<template>
  <div
    class="scope"
    h="screen"
    w="screen"
    flex="~ col"
    overflow="~ hidden"
  >
    <header
      class="scope-header"
      w="full"
      grid="~ cols-[auto_auto_1fr_auto_auto] items-center"
      gap="2"
      bg="teal-800"
      lg="border border-slate-900/10"
      text="~ slate-100"
      p="4"
    >
      <a href="/">
        <img src="/vite.svg">
      </a>

      <div text="white 3xl">
        ABC Notation Score
      </div>
      <div class="space" />
      <!-- <button
        v-for="btn in headerActions"
        :key="btn.name"
        bg="transparent"
        w="10"
        h="10"
        text="white 3xl center"
        flex="~ items-center justify-center"
        hover="shadow-lg border-4 bg-amber-800"
        rounded="md"
        cursor="pointer"
        transition="all 4 ease"
        p=""
        border="none"
      >
        <div :class="[`i-${btn.icon}`]" />
      </button> -->
    </header>
    <main
      class="scope-main"
      grid="~ grow cols-1 rows-2"
      md="grid-rows-1 grid-cols-2"
      overflow="y-hidden"
      h="full"
    >
      <div
        id="edtior"
        ref="editorWrapper"
        grid="~"
        bg="slate-50"
        text="lg"
        w="full"
        overflow="y-scroll"
      />
      <div
        flex="~ col"
        overflow="y-hidden"
      >
        <div
          overflow="y-scroll"
          grid="grow"
          h="full max-h-full"
          bg="slate-50"
          p="4"
        >
          <div
            id="score"
            ref="scoreWrapper"
            bg="white"
            shadow="lg"
          />
        </div>
      </div>
    </main>
    <footer class="scope-footer">
      <div
        id="audio"
        grid="~ items-center justify-items-stretch"
        text="white"
        h="8"
        p="x-1"
        bg="teal-800"
      />
    </footer>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
}

.abcjs-inline-audio {
  background: unset;
}

.abcjs-midi-progress-background {
  border-color: transparent !important;
  background-color: #0000004d !important;
}
</style>
