import { CommandNames } from "general-language-syntax";
import { GlsLine, IRange, Transformation } from "ts-gls";

export interface IUnsupportedComplaint {
    line: GlsLine;
    range: IRange;
}

const visitTransformation = (transformation: Transformation, complaints: IUnsupportedComplaint[]): void => {
    for (const output of transformation.output) {
        if (output instanceof GlsLine) {
            if (output.command === CommandNames.Unsupported) {
                complaints.push({
                    line: output,
                    range: transformation.range,
                });
                break;
            }
        } else if (output instanceof Transformation) {
            visitTransformation(output, complaints);
        }
    }
};

const visitTransformations = (transformations: ReadonlyArray<Transformation>, complaints: IUnsupportedComplaint[]): void => {
    for (const transformation of transformations) {
        visitTransformation(transformation, complaints);
    }
}

export const collectUnsupportedTransforms = (transformations: ReadonlyArray<Transformation>): ReadonlyArray<IUnsupportedComplaint> => {
    const complaints: IUnsupportedComplaint[] = [];

    visitTransformations(transformations, complaints);

    return complaints;
};
