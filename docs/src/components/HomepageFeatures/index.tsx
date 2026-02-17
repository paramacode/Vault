import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
	title: string;
	Svg: React.ComponentType<React.ComponentProps<"svg">>;
	description: ReactNode;
};

const FeatureList: FeatureItem[] = [
	{
		title: "Automatic Cleanup",
		Svg: require("@site/static/img/cleaning_services_24dp_F3F3F3.svg").default,
		description: (
			<>
				Never worry about cleanup again. Vault remembers everything you add and cleans it all up with a single
				call to `Clean()`.
			</>
		),
	},
	{
		title: "Flexible Resource Management",
		Svg: require("@site/static/img/inventory_24dp_F3F3F3.svg").default,
		description: (
			<>
				Works with Instances, Connections, Promises, functions, and custom objects. Add custom cleanup
				strategies for any resource type.
			</>
		),
	},
	{
		title: "Hierarchical Vaults",
		Svg: require("@site/static/img/account_tree_24dp_F3F3F3.svg").default,
		description: (
			<>
				Create parent-child relationships between vaults. Clean a parent vault and all children are
				automatically cleaned too.
			</>
		),
	},
];

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx("col col--4")}>
			<div className="text--center">
				<Svg className={styles.featureSvg} role="img" />
			</div>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	);
}

export default function HomepageFeatures(): ReactNode {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	);
}
