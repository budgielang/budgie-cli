import { CommandNames } from "budgie";
import { BudgieLine, IRange, Transformation } from "ts-budgie";

export interface IUnsupportedComplaint {
    line: BudgieLine;
    range: IRange;
}

const visitTransformation = (transformation: Transformation, complaints: IUnsupportedComplaint[]): void => {
    for (const output of transformation.output) {
        if (output instanceof BudgieLine) {
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
};

export const collectUnsupportedTransforms = (transformations: ReadonlyArray<Transformation>): ReadonlyArray<IUnsupportedComplaint> => {
    const complaints: IUnsupportedComplaint[] = [];

    visitTransformations(transformations, complaints);

    return complaints;
};
