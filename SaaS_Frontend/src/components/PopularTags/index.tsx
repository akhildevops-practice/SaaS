import { useStyles } from "./styles";

/**
 * @description Functional component which returns a card with popular tags link
 * @returns a react node
 */

type Props = {
  header?: any;
  centerTag?: any;
  tags: any;
  totalDocs: any;
  clickHandler?: any;
  alternateStyling?: boolean;
};

const PopularTags = ({
  header,
  centerTag,
  tags,
  totalDocs,
  clickHandler,
  alternateStyling,
}: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.popularTagsContainer}>
      <div className={classes.headerContainer}>
        {alternateStyling ? (
          `${header ? header : `Top 10 Popular Tags`}`
        ) : (
          <strong>{header ? header : `Top 10 Popular Tags`}</strong>
        )}
      </div>
      {/* <div className={classes.centerTag}>{totalDocs} Documents</div> */}
      {/* <div className={classes.centerTag}>{centerTag ? `${totalDocs} ${centerTag}` : `${totalDocs} Documents`}</div> */}
      {alternateStyling ? (
        <div className={classes.centerTag}>
          <strong style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
            {centerTag ? `${totalDocs} ${centerTag}` : `${totalDocs} Documents`}
          </strong>
        </div>
      ) : (
        <div className={classes.centerTag}>
          {centerTag ? `${totalDocs} ${centerTag}` : `${totalDocs} Documents`}
        </div>
      )}
      <div
        // className={classes.documentBox }
        className={
          alternateStyling ? classes.documentBoxAlternate : classes.documentBox
        }
      >
        <div
          className={
            alternateStyling
              ? classes.textFormationAlternate
              : classes.textFormation
          }
          style={{ fontSize: "1.5em" }}
        >
          <span
            data-testid="tag-0"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[0]?.id)}
          >
            {tags[0]?.label ? tags[0]?.label : tags[0]}
          </span>
        </div>
        <div
          className={
            alternateStyling
              ? classes.textFormationAlternate
              : classes.textFormation
          }
          style={{ fontSize: "1.3em" }}
        >
          <span
            data-testid="tag-1"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[1]?.id)}
          >
            {tags[1]?.label ? tags[1]?.label : tags[1]}
          </span>
          <span
            data-testid="tag-2"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[2]?.id)}
          >
            {tags[2]?.label ? tags[2]?.label : tags[2]}
          </span>
        </div>
        <div
          className={
            alternateStyling
              ? classes.textFormationAlternate
              : classes.textFormation
          }
          style={{ fontSize: "1.1em" }}
        >
          <span
            data-testid="tag-3"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[3]?.id)}
          >
            {tags[3]?.label ? tags[3]?.label : tags[3]}
          </span>
          <span
            data-testid="tag-4"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[4]?.id)}
          >
            {tags[4]?.label ? tags[4]?.label : tags[4]}
          </span>
          <span
            data-testid="tag-5"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[5]?.id)}
          >
            {tags[5]?.label ? tags[5]?.label : tags[5]}
          </span>
        </div>
        <div
          className={
            alternateStyling
              ? classes.textFormationAlternate
              : classes.textFormation
          }
          style={{ fontSize: ".9em" }}
        >
          <span
            data-testid="tag-6"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[6]?.id)}
          >
            {tags[6]?.label ? tags[6]?.label : tags[6]}
          </span>
          <span
            data-testid="tag-7"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[7]?.id)}
          >
            {tags[7]?.label ? tags[7]?.label : tags[7]}
          </span>
          <span
            data-testid="tag-8"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[8]?.id)}
          >
            {tags[8]?.label ? tags[8]?.label : tags[8]}
          </span>
          <span
            data-testid="tag-9"
            className={classes.textInsideTags}
            onClick={() => clickHandler?.(tags[9]?.id)}
          >
            {tags[9]?.label ? tags[9]?.label : tags[9]}
          </span>
        </div>
      </div>

      <div className={classes.bottomContainer}></div>
    </div>
  );
};

export default PopularTags;
