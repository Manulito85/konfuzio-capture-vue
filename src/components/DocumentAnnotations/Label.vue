<style
  scoped
  lang="scss"
  src="../../assets/scss/document_annotations.scss"
></style>
<template>
  <div class="labels" ref="label">
    <div
      v-for="annotation in annotations"
      :key="annotationId(annotation)"
      :class="[
        'label-properties',
        isAnnotationSelected(annotation) && 'selected',
        isAnnotationInEditMode(annotationId(annotation)) && 'editing'
      ]"
      :ref="referenceId(annotation)"
      @click="onLabelClick"
      @mouseenter="onLabelHover(true, annotation)"
      @mouseleave="onLabelHover(false, annotation)"
    >
      <div class="label-property-left">
        <LabelDetails
          :description="label.description"
          :annotation="annotation"
        />
        <div class="label-property-name">
          <span class="label-property-text">{{ label.name }} </span>
        </div>
      </div>
      <div class="label-property-right">
        <div class="label-property-annotation">
          <div v-if="annotation">
            <Annotation
              v-for="(span, index) in annotation.span"
              :key="index"
              :annotation="annotation"
              :span="span"
              :spanIndex="index"
              :handleError="handleError"
              :handleMessage="handleMessage"
              :label="label"
              :annotationSet="annotationSet"
              :handleMenu="handleMenu"
            />
          </div>
          <EmptyAnnotation
            v-else
            :label="label"
            :annotationSet="annotationSet"
            @handle-data-changes="handleDataChanges"
            :handleError="handleError"
            :handleMessage="handleMessage"
            :handleMenu="handleMenu"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import LabelDetails from "./LabelDetails";
import Annotation from "./Annotation";
import EmptyAnnotation from "./EmptyAnnotation";

/**
 * This component shows each label and it's annotations
 */
export default {
  name: "Label",
  components: { LabelDetails, Annotation, EmptyAnnotation },
  props: {
    label: {
      required: true
    },
    annotationSet: {
      required: true
    },
    handleScroll: {
      type: Function
    },
    handleMessage: {
      type: Function
    },
    handleError: {
      type: Function
    },
    handleMenu: {
      type: Function
    },
    missingAnnotations: {
      type: Array
    }
  },
  computed: {
    ...mapState("document", [
      "documentFocusedAnnotation",
      "sidebarAnnotationSelected"
    ]),
    ...mapGetters("document", ["isAnnotationInEditMode"]),
    labelHasAnnotations() {
      return (
        this.label &&
        this.label.annotations &&
        this.label.annotations.length > 0
      );
    },
    annotations() {
      if (this.labelHasAnnotations) {
        return this.label.annotations;
      } else {
        return [null];
      }
    }
  },
  data() {
    return {
      edited: false,
      annotationAnimationTimeout: null
    };
  },
  methods: {
    referenceId(annotation) {
      let refId = `label_${this.label.id}_${this.annotationSet.id}`;
      if (annotation) {
        refId = `${refId}_${annotation.id}`;
      }
      return refId;
    },
    annotationId(annotation) {
      return annotation
        ? annotation.id
        : `${this.annotationSet.id}_${this.label.id}`;
    },
    handleDataChanges({ annotation }) {
      if (annotation !== null) {
        if (!this.labelHasAnnotations) {
          this.label.annotations = [annotation];
        }
      }
    },
    onLabelHover(value, annotation) {
      if (value) {
        this.handleScroll(!value);
      }

      if (annotation && value) {
        const focusedAnnotation = { ...annotation };
        focusedAnnotation.label_name = this.label.name;
        this.$store.dispatch(
          "document/setDocumentFocusedAnnotation",
          focusedAnnotation
        );
      } else {
        this.$store.dispatch("document/setDocumentFocusedAnnotation", null);
      }
    },
    onLabelClick() {
      if (
        this.documentFocusedAnnotation &&
        this.documentFocusedAnnotation.is_correct
      ) {
        this.handleScroll(true);
      }
    },
    isAnnotationSelected(annotation) {
      if (annotation) {
        return (
          this.sidebarAnnotationSelected &&
          annotation.id === this.sidebarAnnotationSelected.id
        );
      }
      return false;
    }
  },
  watch: {
    sidebarAnnotationSelected() {
      // if an annotation is selected, scroll to it
      if (this.sidebarAnnotationSelected) {
        const annotation = this.annotations.find(
          annotation =>
            annotation && this.sidebarAnnotationSelected.id === annotation.id
        );

        if (annotation) {
          const refId = this.referenceId(annotation);
          clearTimeout(this.annotationAnimationTimeout);
          if (this.$refs[`${refId}`] === undefined) {
            return;
          }

          this.$refs[`${refId}`][0].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
          });

          // remove annotation selection after some time
          this.annotationAnimationTimeout = setTimeout(() => {
            this.$store.dispatch("document/setSidebarAnnotationSelected", null);
            this.handleScroll(false);
          }, 1500);
        }
      }
    }
  }
};
</script>
