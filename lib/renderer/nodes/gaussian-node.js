import { RenderNode      } from './render-node.js';
import { GaussianProgram } from '../programs/gaussian-program.js';

/**
 * The Gaussian Directional Node is responsible for blurring the previous pass using gaussian blur in a single direction (3-tap).
 * Run a second GaussianDirectionalNode in the opposite direction for full 9-tap
 */
 export class GaussianDirectionalNode extends RenderNode {
    static type = 'screen';

    static program = GaussianProgram;

    static input = {
        color: { type: 'texture' },
    }

    static output = {
        color: { type: 'texture', attachmentType: 'color' },
    }

    constructor(pipeline, { direction = 'vertical', bilateral = true }){
        super(pipeline);
        this.direction = direction;
        this.bilateral = bilateral;
    }
}

/**
 * The Guassian Node is responsible for blurring the previous pass using guassian blur in a double pass (9-tap).
 */
export class GaussianNode extends GaussianDirectionalNode {

    horizontal = new GaussianDirectionalNode(this.pipeline, { direction: 'horizontal', bilateral: this.bilateral });

    constructor(pipeline, { bilateral = true }){
        super(pipeline, { direction: 'vertical', bilateral });
    }

    render(graph, input) {
        let count = input.passes;
        while(count--) {
            this.horizontal.render(graph, input);
            super.render(graph, this.horizontal.output);
            input = this.output;
        }

        return this.output;
    }

    resize({ width, height }){
        super.resize({ width, height });
        this.horizontal.resize({ width: this.width, height: this.height });
    }

    clearProgramCache() {
        super.clearProgramCache();
        this.horizontal?.clearProgramCache();
    }
}

export default GaussianNode;